#!/bin/env bash
set -euo pipefail

cd ~/tokyo2024-poster-map/ #Path to the folder

git pull

# Download latest CSV from spreadsheet datbase
curl -sL "https://script.google.com/macros/s/AKfycbzE00zLkrl-k0-MWb0wbshUrLGuaPIUZNl_wPXGVxpU01DiBfS6mcUzFe8YzyHWXw8a/exec" > public/data/all.csv

# all.json
python3 csv2json_small.py public/data/all.csv public/data/

# summary.json
python3 summarize_progress.py ./public/data/summary.json

# summary_absolute.json
python3 summarize_progress_absolute.py ./public/data/summary_absolute.json

git add -N .

if ! git diff --exit-code --quiet
then
    git add .
    git commit -m "Update"
    git push
    source .env
    npx netlify-cli deploy --prod --message "Deploy" --dir=./public --auth $NETLIFY_AUTH_TOKEN
fi
