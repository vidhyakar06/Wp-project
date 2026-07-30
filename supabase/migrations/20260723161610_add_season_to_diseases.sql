/*
# Add season column to diseases table

1. Changes
- Adds `season` (text, nullable) column to the `diseases` table.
- Populates the new column with the Indian cropping season (Kharif, Rabi, Zaid, or All Season) for each disease's crop.
- Indian seasons: Kharif (June-October, monsoon), Rabi (November-April, winter), Zaid (March-June, summer), All Season (year-round).

2. Security
- No RLS policy changes. Existing policies remain intact.
*/

ALTER TABLE diseases ADD COLUMN IF NOT EXISTS season text;

UPDATE diseases SET season = 'Kharif' WHERE crop_name IN ('Banana', 'Chilli', 'Cotton', 'Groundnut', 'Maize', 'Paddy', 'Soybean', 'Sugarcane');
UPDATE diseases SET season = 'Rabi' WHERE crop_name IN ('Onion', 'Potato', 'Wheat');
