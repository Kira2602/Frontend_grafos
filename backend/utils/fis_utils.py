import re

def parse_fis_content(content_str):
    """
    Parsea el contenido de texto de un archivo .fis a un diccionario JSON.
    """
    lines = content_str.splitlines()
    fis_data = {
        "Name": "Untitled",
        "Type": "mamdani",
        "Inputs": [],
        "Outputs": [],
        "Rules": []
    }
    
    current_section = None
    current_var = None
    
    # Regex para detectar MFs: MF1='nombre':'tipo',[params]
    mf_pattern = re.compile(r"MF(\d+)='(.*?)':'(.*?)',\[(.*?)\]")

    for line in lines:
        line = line.strip()
        if not line or line.startswith('%'): continue

        # Detectar secciones
        if line.startswith('[System]'):
            current_section = 'System'
            continue
        elif line.startswith('[Input'):
            current_section = 'Input'
            fis_data["Inputs"].append({"Name": "", "Range": [], "MFs": []})
            current_var = fis_data["Inputs"][-1]
            continue
        elif line.startswith('[Output'):
            current_section = 'Output'
            fis_data["Outputs"].append({"Name": "", "Range": [], "MFs": []})
            current_var = fis_data["Outputs"][-1]
            continue
        elif line.startswith('[Rules]'):
            current_section = 'Rules'
            continue

        # Procesar contenido según sección
        if current_section == 'System':
            if line.startswith('Name='): fis_data['Name'] = line.split('=')[1].replace("'", "")
            if line.startswith('Type='): fis_data['Type'] = line.split('=')[1].replace("'", "")

        elif current_section in ['Input', 'Output']:
            if line.startswith('Name='): 
                current_var['Name'] = line.split('=')[1].replace("'", "")
            elif line.startswith('Range='):
                # Convertir "[0 1]" a lista [0, 1]
                raw_range = line.split('=')[1].replace('[', '').replace(']', '')
                current_var['Range'] = [float(x) for x in raw_range.split()]
            elif line.startswith('MF'):
                match = mf_pattern.search(line)
                if match:
                    params = [float(x) for x in match.group(4).split()]
                    current_var['MFs'].append({
                        "Name": match.group(2),
                        "Type": match.group(3),
                        "Params": params
                    })

        elif current_section == 'Rules':
            # Las reglas en FIS suelen ser: "1 1, 1 (1) : 1" (InputIdx... , OutputIdx... (Weight) : Logic)
            # Simplemente las guardamos como string o lista de números para pasarlas a addRule
            # Para MATLAB addRule necesitamos una matriz numérica.
            # Limpiamos caracteres extraños para dejar solo números
            clean_rule = line.replace(',', ' ').replace('(', ' ').replace(')', ' ').replace(':', ' ')
            rule_nums = [float(x) for x in clean_rule.split()]
            fis_data["Rules"].append(rule_nums)

    return fis_data