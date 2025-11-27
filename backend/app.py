from flask import Flask, request, jsonify
import matlab.engine
import threading
import os
from utils.fis_utils import parse_fis_content

app = Flask(__name__)

# --- CONFIGURACIÓN: FIS POR DEFECTO ---
DEFAULT_FIS_CONTENT = """[System]
Name='ejemploNabarrete'
Type='mamdani'
Version=2.0
NumInputs=3
NumOutputs=1
NumRules=27
AndMethod='min'
OrMethod='max'
ImpMethod='min'
AggMethod='max'
DefuzzMethod='centroid'

[Input1]
Name='interes'
Range=[0 100]
NumMFs=3
MF1='bajo':'trapmf',[0 0 30 60]
MF2='regular':'trapmf',[20 45 60 75]
MF3='bueno':'trapmf',[70 80 100 100]

[Input2]
Name='calidadDocente'
Range=[0 10]
NumMFs=3
MF1='malo':'trapmf',[0 0 5 7]
MF2='bueno':'trapmf',[3 7 8 9]
MF3='excelente':'trapmf',[8 9 10 10]

[Input3]
Name='infraestructura'
Range=[0 100]
NumMFs=3
MF1='pesima':'trapmf',[0 0 30 40]
MF2='regular':'trapmf',[30 45 55 80]
MF3='buena':'trapmf',[70 80 100 100]

[Output1]
Name='rendimientoAcademico'
Range=[0 100]
NumMFs=3
MF1='absoluteNabo':'trapmf',[0 0 60 70]
MF2='bueno':'trapmf',[50 65 75 80]
MF3='brillilant':'trapmf',[70 90 100 100]

[Rules]
1 1 1, 1 (1) : 1
2 1 1, 2 (1) : 1
3 1 1, 2 (1) : 1
1 2 1, 1 (1) : 1
2 2 1, 2 (1) : 1
3 2 1, 2 (1) : 1
1 3 1, 1 (1) : 1
2 3 1, 2 (1) : 1
3 3 1, 2 (1) : 1
1 1 2, 1 (1) : 1
2 1 2, 2 (1) : 1
3 1 2, 2 (1) : 1
1 2 2, 1 (1) : 1
2 2 2, 2 (1) : 1
3 2 2, 2 (1) : 1
1 3 2, 1 (1) : 1
2 3 2, 2 (1) : 1
3 3 2, 3 (1) : 1
1 1 3, 1 (1) : 1
2 1 3, 2 (1) : 1
3 1 3, 2 (1) : 1
1 2 3, 1 (1) : 1
2 2 3, 2 (1) : 1
3 2 3, 2 (1) : 1
1 3 3, 1 (1) : 1
2 3 3, 2 (1) : 1
3 3 3, 3 (1) : 1
"""

eng = None
eng_lock = threading.Lock()

def start_engine():
    global eng
    if eng is None:
        print("Iniciando MATLAB Engine...")
        eng = matlab.engine.start_matlab()
        print("MATLAB Engine iniciado correctamente.")
start_engine()

@app.route('/test_matlab', methods=['GET'])
def test_matlab():
    global eng
    if eng is None:
        return jsonify({"error": "MATLAB engine no está iniciado"}), 500
    try:
        with eng_lock:
            res = eng.sqrt(4.0, nargout=1)
        return jsonify({"status": "ok", "matlab_result": float(res)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/launch_fuzzy', methods=['GET', 'POST'])
def launch_fuzzy():
    fis_content = None
    source_type = "default"

    try:
        if request.method == 'POST' and 'file' in request.files:
            file = request.files['file']
            if file.filename != '':
                fis_content = file.read().decode('utf-8')
                source_type = "uploaded_file"

        if fis_content is None and request.is_json:
            data = request.get_json()
            if 'fis_content' in data:
                 fis_content = data['fis_content']
                 source_type = "json_content"
            elif 'fis_path' in data:
                path = data['fis_path']
                if os.path.exists(path):
                    with open(path, 'r') as f: fis_content = f.read()
                    source_type = "local_path"

        if fis_content is None:
            if request.method == 'GET' and request.args.get("fis_path"):
                 path = request.args.get("fis_path")
                 if os.path.exists(path):
                     with open(path, 'r') as f: fis_content = f.read()
                     source_type = "local_path_arg"
                 else:
                     fis_content = DEFAULT_FIS_CONTENT
            else:
                fis_content = DEFAULT_FIS_CONTENT

    except Exception as e:
        return jsonify({"error": f"Error leyendo entrada: {str(e)}"}), 500

    global eng
    try:
        fis_json = parse_fis_content(fis_content)
        
        with eng_lock:
            # 1. Limpiar workspace
            eng.eval("clear myFis ruleList;", nargout=0)

            # 2. Crear sistema usando constructores MODERNOS (mamfis / sugfis)
            sys_name = fis_json.get('Name', 'System')
            sys_type = fis_json.get('Type', 'mamdani')
            
            if sys_type.lower() == 'mamdani':
                eng.eval(f"myFis = mamfis('Name', '{sys_name}');", nargout=0)
            else:
                eng.eval(f"myFis = sugfis('Name', '{sys_name}');", nargout=0)

            # 3. Agregar INPUTS usando addInput
            for inp in fis_json['Inputs']:
                range_str = str(inp['Range']).replace(',', ' ') 
                
                # Crear Input
                cmd_input = f"myFis = addInput(myFis, {range_str}, 'Name', '{inp['Name']}');"
                eng.eval(cmd_input, nargout=0)
                
                # Agregar MFs
                for mf in inp['MFs']:
                    # CORRECCIÓN: Sintaxis addMF(fis, varName, mfType, mfParams, ...)
                    # Ya NO se pasa 'input' como segundo argumento.
                    params_str = str(mf['Params']).replace(',', ' ')
                    
                    cmd_mf = f"myFis = addMF(myFis, '{inp['Name']}', '{mf['Type']}', {params_str}, 'Name', '{mf['Name']}');"
                    eng.eval(cmd_mf, nargout=0)

            # 4. Agregar OUTPUTS usando addOutput
            for out in fis_json['Outputs']:
                range_str = str(out['Range']).replace(',', ' ')
                
                # Crear Output
                cmd_output = f"myFis = addOutput(myFis, {range_str}, 'Name', '{out['Name']}');"
                eng.eval(cmd_output, nargout=0)
                
                # Agregar MFs
                for mf in out['MFs']:
                    # CORRECCIÓN: Sintaxis addMF(fis, varName, mfType, mfParams, ...)
                    # Ya NO se pasa 'output' como segundo argumento.
                    params_str = str(mf['Params']).replace(',', ' ')
                    
                    cmd_mf = f"myFis = addMF(myFis, '{out['Name']}', '{mf['Type']}', {params_str}, 'Name', '{mf['Name']}');"
                    eng.eval(cmd_mf, nargout=0)

            # 5. Agregar REGLAS usando addRule
            if fis_json['Rules']:
                rules_matrix = matlab.double(fis_json['Rules'])
                eng.workspace['ruleList'] = rules_matrix
                eng.eval("myFis = addRule(myFis, ruleList);", nargout=0)

            # 6. Lanzar GUI
            eng.eval("desktop; drawnow;", nargout=0)
            eng.eval("fuzzyLogicDesigner(myFis);", nargout=0)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error procesando FIS en MATLAB: {str(e)}"}), 500

    return jsonify({
        "status": "success",
        "message": "Fuzzy Logic Designer abierto correctamente (Modo Moderno)",
        "loaded_system": fis_json.get('Name'),
        "source": source_type
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)