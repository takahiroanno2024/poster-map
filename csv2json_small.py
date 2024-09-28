import pandas as pd
import sys
import os

def main(input_path, output_path):
    arealist = pd.read_csv("arealist.csv")
    data = pd.read_csv(input_path)

    arealist = arealist[['area_id', 'area_name', 'area_block']]
    data.rename(columns={'area': 'area_name'}, inplace=True)

    # ファイルサイズ削減のためarea_nameをarea_idで置換
    merged_data = pd.merge(data, arealist, on='area_name', how='left', suffixes=('', ''))

    final_data = merged_data.copy()[['area_id', 'name', 'lat', 'long', 'status', 'note']]

    area_blocks = {
        '23-east': '23区東部',
        '23-west': '23区西部',
        '23-city': '23区都心部',
        'tama-north': '多摩北部',
        'tama-south': '多摩南部',
        'tama-west': '多摩西部',
        'island': '島しょ部',
    }
    
    for block_key, block_name in area_blocks.items():
        block_areas = arealist[arealist['area_block'] == block_name]['area_id']
        filtered_data = final_data[final_data['area_id'].isin(block_areas)]
        
        filtered_output_path = os.path.join(output_path, 'block', f'{block_key}.json')
        filtered_data.to_json(filtered_output_path, orient='records', force_ascii=False)
        print(f"Filtered file saved to {filtered_output_path}")

    json_output_path = os.path.join(output_path, 'all.json')
    final_data.to_json(json_output_path, orient='records', force_ascii=False)
    print(f"File saved to {json_output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_path> <output_path>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    main(input_path, output_path)
