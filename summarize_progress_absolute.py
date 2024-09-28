import pandas as pd
import json
import sys

all_df = pd.read_csv('public/data/all.csv')
arealist_df = pd.read_csv('arealist.csv')

# 各地域
status_counts = all_df.groupby('area').apply(
   lambda x: len(x) - (
       (x['status'] == 1).sum() + #完了
       (x['status'] == 2).sum() + #異常
       (x['status'] == 4).sum() + #要確認
       (x['status'] == 5).sum() + #異常対応中
       (x['status'] == 6).sum() #削除
   )
).reset_index(name='progress')

# 全体
overall_progress = len(all_df) - (
    (all_df['status'] == 1).sum() + #完了
    (all_df['status'] == 2).sum() + #完了
    (all_df['status'] == 4).sum() + #完了
    (all_df['status'] == 5).sum() + #完了
    (all_df['status'] == 6).sum() #削除
)

area_mapping = dict(zip(arealist_df['area_name'], arealist_df['area_id']))
all_areas = pd.DataFrame(area_mapping.items(), columns=['area', 'area_id'])

merged_df = all_areas.merge(status_counts, on='area', how='left')
merged_df['progress'] = merged_df['progress'].fillna(0)
merged_df = merged_df[['area_id', 'progress']].sort_values(by='area_id')

result_dict = { "{}".format(row['area_id']): "{}".format(row['progress']) for _, row in merged_df.iterrows()}
result_dict['total'] = "{}".format(overall_progress)

print(result_dict)

output_file_path = sys.argv[1]

with open(output_file_path, 'w', encoding='utf-8') as f:
    json.dump(result_dict, f, ensure_ascii=False, indent=2)

print(f"Results have been written to {output_file_path}")
