-- Migration: Import stores from CSV
-- Generated: 2025-10-05T06:22:03.429Z
-- Total stores: 248

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'LAF ARCHIVES',
  'Japan, 〒530-0015 Osaka, Kita Ward, Nakazakinishi, 1-chōme−9−１５ オアシスナカザキ 204',
  'Kita Ward',
  'Nakazakicho',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5036682, 34.7086148), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'LAF ARCHIVES — Designer/archival fashion retailer located in Kita.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'LVMY LND',
  'Japan, 〒164-0001 Tokyo, Nakano City, Nakano, 5-chōme−1−１１ ヴィラ石井 1F',
  'Nakano City',
  'Nakano',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6717671, 35.7067096), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'LVMY LND — Fashion boutique / clothing store located in Nakano. Info: @lvmylnd, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c1U1c1_s-WM9H0vj1ZiDbaNnnsAQ8uzIjElrj5Zc3F4OvXQ-2e0gj0ZVVexgM1s55ijVzIpUkwK8IctmzzHg6T4tSdDdi8xT3DSY9X3WEQIUZ1Jacw9oxVpTiVta47oE0LUUSVsoF55bZae7f_uuuJYlh6QlvbK7rIs6U20IX3479GWmxfMMQ7bq6VQRrMafYt_th2aFsOTdjUIW1XEr7n7f42-NSc_0LClkz3xqHDxcVWo-3FadXJJTBLj6S2VNy60EUPKBrjLr_Q9Gx7YROo3bEq9ILqVOyb96PqGfzQlQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/lvmylnd/',
  '@lvmylnd',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'VNL',
  'Japan, 〒542-0081 Osaka, Chuo Ward, Minamisenba, 4-chōme−8−８ DAZZ COMPLEX 2F',
  'Chuo Ward',
  'Shinsaibashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4990754, 34.6777168), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'branche — Fashion boutique / clothing store located in Chuo. Info: @branche.official, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fO0RR5G3reCpBGGRsXOGtWGE2V1gyOYFgHfUtMWF87bV9qonZL-rURK23uuRsNTDhv3kmYS5SsaFv9c35aCS_oM6AZH1Km1GQlxdPVXW4TX4IXEoIsj7JlCI3i4kwJwXXxPetxxYu-3G0IIIkpCcmxA1FS8i5uWIIhY86NaFEt-48ex1etKbiRIeO_gjnoanEYs4HgiPXhQr0gv2RubiVJP-8StJn0wTxllgzIDF77Uv1LBVsMhY9dbyYW5ukEfgHFpJ8NDnzao6U49cjiIEBM5XhTNootZuthBN74alMZEHzo1uFLAM-dzPNwcV1YRN3RNB2-CpRJDxyLHBer3-QwisT0oCDTtApl_djQjMlU5JHe6Vf1Pa6J8j0L-4AEWf2Epe2ZIgu8Ar_CWTj3uGQTmnAubrRuHwd_QR03YeQj4w&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://branche.official.ec/',
  '@branche.official',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Santo-nibunno-ichi',
  'Japan, 〒542-0086 Osaka, Chuo Ward, Nishishinsaibashi, 1-chōme−16−１５ 川西ビル 2F',
  'Chuo Ward',
  'Shinsaibashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4977179, 34.6724883), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Santo-nibunno-ichi — Fashion boutique / clothing store located in Chuo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eaI0lEPUIBYHUx5pbv6UCcYiM5t2anHgrcFddPy-TZ5suPB2g4zQ3MeXtL_aCXZ7a-3ujmGFMusLnMqzWYTVDQcwDhab5CYGZA8Dkh4YaeWE1XmYq8MMvji6kaR4ZDaIUxl8yOnsO2wCRdoHsId9uTg70R82f4olHyPtkmhHtD-3p_cVbrZqw0T_95-5Q7CYLF8zWmGwxr6YfD9hDP3faLcG6V9sNxMhZTurUWbn4xj4p417j5cixPomxaezy43rALXew0c_bbWBA8lRE0flcyb6o0e51UF5kZ4XoUUfloCfm-iSQjQMDgKQYESu6e4YSqf4vzS1rvzypvc-0ifHXPxDk4kA7dKt0_d5BflXFkkUCJZYEE2cW7Y_V1B13_FfNUwBHYS06v7EACJKVQFyZuhxjpibslOCifRCtQLVD6JA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ether',
  'Japan, 〒465-0024 Aichi, Nagoya, Meito Ward, Hongō, 2-chōme−５４−１ 本郷ミユキビル',
  'Nagoya',
  'Nagoya',
  'Japan',
  ST_SetSRID(ST_MakePoint(137.0130244, 35.1768146), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'エーテル — Fashion boutique / clothing store located in Nagoya. Info: @ether_02, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e5WHgpMFPXrZYcWLhiOmER7UvLFJMkUvqit29PgHpBzZr8W5xpg7CJkoi9OKEjM2lSxn3S6iUU9TH7VFmHk2Vj6oAKh64yjV75NX079kZnFwUIE3oTpIsYVDpk_Ag5hgpcqCx2cQdg0yGttS393dENc38vAVAh5uhXYWCVToLrEtvafksiyXtro_IddyKmLC2efMUA2bBNd6tuRowGRw63_kGjrYOB4HZvKiFUJL0J5NpDZbWrpTitd8slcUS2Emwgz1l70jAlssj8yhXseZ9f9rTCSiBQZ7HEfSDUiLry-oYoWYHfVPqv7hWfV_xxLHDcg14q4R6Ek9YTsEE23-jyE7FU11zemLQRc7zVRs9YwyEya1e2qv1EWrHNv9hqFX22f7CH9yvEUOPQV430fnXDCLutp9jaVS0WC-eXzQ_DZw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/ether_02',
  '@ether_02',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '古着屋PARER綾瀬店',
  'Japan, 〒120-0004 Tokyo, Adachi City, Higashiayase, 1-chōme−26−７ 東綾瀬ハイツ 1',
  'Adachi City',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(139.8311357, 35.7661526), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '古着屋PARER綾瀬店 — Vintage and used clothing shop located in Adachi. Info: @parer.ayase, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dV8N3KI-K2tF3UBFjeKPZVZdqqxSpOHju8RwfC-G3ecqs-AEeBNqTJCwBCTr7eFUVhqFv9Q-ETh4SiH1VuXAyGYX3EP14ENg28oFn3hEHMjFl2P-pyl8K1BMjbajuGNXKsvFQvpL2yOo20uz-0OvQZ2sWf6K1kGVi4FYSed559Ff0dni4vZ6Nfpc0vYteQ4hGokFEq9UsqJtHwO8K4Jnbs-9a5NMk7UQKyZqLyx5ci6NsYGvv4lIuMm24V1RS6FGWTGBjAcXqLxeNbN9CbB7wUTAwU5kwvKkaBMdSr5HuJDg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/parer.ayase?igsh=MXBwYmswa3VzenNxeA==&utm_source=qr',
  '@parer.ayase',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'mementos 2号店',
  '1-chōme-2-17 Kitahorie, Nishi Ward, Osaka, 550-0014, Japan',
  'Osaka',
  'Horie',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4968041, 34.6728963), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'mementos 2号店 — Fashion boutique / clothing store located in Kita.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fpnreKpfzMOhJRM4yXcsfHhYdUvBWKBEhx6D6nMzUU1Isd01JjCij6j_yrvITOXJxQDaUPOLzJnEb9tmrFkBzl7Djom-qcgi45k3S_RR-UuOfdrlc_pHw4f0Z8ng2mS_kZQR4W4HP18Nh0TPaVO9KvmLovR_oRZTefYVBPttNO-9vbCHuGBJIM-gvInrdKhoaUoSnOwRFp7lQxmYHUEW-mEGJbt93M5ZAFfScwgVB6Ost4ZHPqHUUeg5P-uVHmMAf67KvkRySmZRu9HzUFYyRF_mZcqe6ix8cORshTQDdJ1uNuZP9SeUhRl50bt3A4YyGEYU9JnymE-B43YKV0dhG_Rhu4bdgNuNO9BUCuEakxqmkOspylWFLF6PrbPBUNmSJpPHbZs4jvASfQZK_kPXNE7MbMmtCG2wR3xLRSsLpHIw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.mementos-jp.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'mementos 1号店',
  '1-chōme-5-2 Kitahorie, Nishi Ward, Osaka, 550-0014, Japan',
  'Osaka',
  'Horie',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.496463, 34.673879), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'mementos 1号店 — Fashion boutique / clothing store located in Kita.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fAmcW54h4Et-XSLUoTpj2iA4rFrHzL73qcuKg5RsYo09dssSQZKQohjDUeOK-0onQ3vbt8IEhJ8VCe6GVydWZoZdY5Cs5R8n1TCIG-umY_N2tYhKiIFmghlR9J4M6ACLuFqgFfpYbO3HnRBNsx9KNqLEtrt8fuu7v6YkHN_pdOZynqvCoFvKi_klk5qzjCpN6qGkHT-JrML7z3qym6Z5jfD6Vx2maESsaPmONK8T8JIhZR8Odcq8sAJfoeLxdMUTJiOEjfaJ-myXs7un8durDhnZZU4901RzN4NXubGdx9dY_mRTVLKI1do7TYcWzYCwAG_5q0yVK1iq-y7RqKTVALY-ZjL9Xn7BxU7GHqjM5bavJ2A2yWXG44t_DaDX_m2AOhrojZDBLPyZfa4gLLDYlpQ2OeQWPc01jt6MTbHm6YLg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.mementos-jp.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'PROVIDÉNCE',
  'Sander Sinsaibashi Bldg., 701 1-chōme-13-5 Nishishinsaibashi, Chuo Ward, Osaka, 542-0086, Japan',
  'Chuo Ward',
  'Shinsaibashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.499021, 34.674837), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'PROVIDÉNCE — Fashion boutique / clothing store located in Chuo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f-4p59f6Bnys_Qd5_57TR5VI3Dh5j4d9jqoFbvIgdbBmEySG-2aOF3ItCltfThIOOdtSGoJ_VY3l21jgP72t4RaVupVeBa2K02TOQPG-J0jjUOMqhXfdc-QP7Ocv0EwqYtke-G2Xic0jR_dfJXWT0-00idiJnTOXOWFQvB51qzkGU_BfYtpZCcsmLbq9pHUBi9Y-lhq9wGs5v17kwIaJt3QNKRQvvqV4o5Th5VwFCBpMM8KK2cwAfNoXCv8JLaTHRnQOkis4h7dNmDi6WGub_qWGyZ7fTUwW4Y9jju4ZFTGQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://providenece.base.shop/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'SINUS.',
  '9-5 Higashidōrinakamachi, Akita, 010-0003, Japan',
  '010-0003',
  'Kita',
  'Japan',
  ST_SetSRID(ST_MakePoint(140.1336897, 39.7140714), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'SINUS. — Fashion boutique / clothing store located in Kita.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'any penny',
  '2-chōme-9-3 Takaban, Meguro City, Tokyo 152-0004, Japan',
  'Tokyo 152-0004',
  'Meguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.688678, 35.6289364), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'any penny — Fashion boutique / clothing store located in Meguro. Info: @anypenny, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eIuWaZYU1W1qDWYHI_qI3h3OzAAoFk4KQOX-aDskic9KTwNxYFeIFMqyuVcjx7uStmWKHxboBZwbPXp5rg2rTrdACLUkcaLMU3wap8ms2Jpalxc7U2t0NY8VwmXhjw6a1xyvW3mOzXrkQIH7QAqf59dBwIHv-CKdloTdW75YWE_Qy9t1BLT3QVLfardyK970p86QNc_F3LNJx4nDt74DuoXO5KKrrsccu0wq1U3_pF7WYWbpgueGPFkzgS1zECxOAKpWD-UwZ_LZGgS5jF1IW_3HuwIswkI1rvDbPgLGOP3Hu_HeeZGuLqUJkP3Di-FVSIwtk_OFrRbLX7TVOR2XGR8wCSR6QWfw6Yq_8-CmLEVSZFinr87Lwj1DNVjdU0pTbK8qEHNv78QnTWYuFwQxnuguSI-0g94a7Hpw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/anypenny',
  '@anypenny',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ANDANTEANDANTE',
  '17-4 Shindenchō, Chuo Ward, Chiba, 260-0027, Japan',
  'Chiba',
  'Chiba',
  'Japan',
  ST_SetSRID(ST_MakePoint(140.1126135, 35.6072929), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ANDANTEANDANTE — Fashion boutique / clothing store located in Chuo. Info: @andanteandante.s, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fAvB3QDbShhud1sq77t6DY9tJXjZDrwqQAJRjG_0XqRiGk9BvfaJOuQOqzHEHRIWBYlsIittuSm3X3SX-eVCykteI1rIhQ_AbCq5JctpTbjIkpARW9Bqr7cylE_HSL-p3Rw5mMsQS1P-X9JuYuhnA9JXKP1XBmGRDq1OJFuFvL38mPBrrOSNLKtMFi70MKecQN4YFAvXF7OfFLINSceSIHP2whNs1xZnRWh-UZGDgaeWBX5eNwNiKPgmQaP-W0uDREwVLR69xrtGNC7-pRVK2D_tRoLER1u_eDsb2cIQGCiBfROgHhxYQusRhZBHjwCnDkmZoyTAT5C9TYAJaH5taM_6A0VIazObxC_Onc9iTaqjjqMLEZYQLajwBYGAqUVydI1AWzAqL2dtMOuuDc17P4fD12TpB4wceNHqGuEZ8&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/andanteandante.s?igshid=YmMyMTA2M2Y=',
  '@andanteandante.s',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'THE ELEPHANT',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 2-chōme−31−２ factory_01 B1F',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7092073, 35.6734757), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'THE ELEPHANT — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cigx6JZ7Pi4fIco0xAUXE1c7JgVca_IdPrh3BzFLDDAy8z2b8o4XFPWUJF8jMUKf1YUmNQUeb4u_htONTRXkiGpEKyOh65ALTNcdiV-0hB6Whdj9Lpa62x1AivQ_0RaJNg6Tlz-ueyM1LTMMSCQBtOBdc2CGmozmNGh8s5ZTQmlApA15RMG9qfYTChFUkb7mUK3xgWWn9EVkJUj-xUlunob62ptLVk0MMYBBBTVLN1WfQHZpkmcHGQYXVKQ8RynNNK3SWQCKZU5EcK29vz1XeoSb9EU3oHNfRWcIZ1RUUDMg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://theelephantmarket.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'no shape (神戸古着屋)',
  'Japan, 〒650-0023 Hyogo, Kobe, Chuo Ward, Sakaemachidōri, 3-chōme−2−２ 和栄ビル３号館 1階 奥(105号室',
  'Kobe',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(135.1859929, 34.686308), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'no shape (神戸古着屋) — Vintage and used clothing shop located in Chuo. Info: @no___shape, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fAHWO698pfr9MD8KT4-6YYnZ8o5c-6eS-RZcD31Qr0T5cBZVmwQdBwgziqNoRIITHNTkuF_lZyZbgidxi6-Bogo65BH4lNT4Q8b2-W0hCDOM85urtUGO-lsKoMLSjduGI7pgdvhLPFcKBPplBpcpOxnzjCogwFRefkeGRqQLW5VyttjjkK-e4jsx9uwsD0V4JOeIXBj2nR_fGWXNv2PSkRZHsOhcDnlHjaB668vCDvpSJUlGj-qfOcvLgEM-xVRW39f1-7C5nmHA2tXGjCDIDVXYGJZDZ0TseK8fNJ_qAq1A&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/no___shape',
  '@no___shape',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'pp9(ピーピーナイン)',
  'Japan, 〒150-0002 Tokyo, Shibuya, 2-chōme−2−１ 青山グリーンプラザビル 4F',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7084744, 35.6608119), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'pp9(ピーピーナイン) — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fjKN7VTuOPJJxJ4mM6htDVlFkymLpxXXu78DX-sqJfNiQYC1okQsasUd-ML6NU1EeTmHHD9oyuEc-xeARfvqrMpdQX5tIDFCInihCwt9H8YNJtr1UTs1W3RdzYUg0ITwoSz5EvKcjsQdaAVwmqDGR4Dj87ZxFyUcYyLaXzrAbnBkIj00zHDqoFNskcO2kyeZLEiMmVm20Z95O2L1kXDI5tzBsNnJGixnxqXtoad44Zum1KQCwZ_frTRrvabJq9n4fjMtYeT6uFKmDnEwJxZK2JIqoToTaEH3QEqUBCXdagjQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ESSENCE store',
  'Japan, 〒460-0011 Aichi, Nagoya, Naka Ward, Ōsu, 3-chōme−1−３６ 林太陽ビル ７F',
  'Nagoya',
  'Nagoya',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.9035007, 35.1615726), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ESSENCE store — Fashion boutique / clothing store located in Nagoya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dubdeveBHs5-Aey7QcSrqTwP0KPktjcxibP7QalHUIMK6gFj4f85-eRgVNc_076EoO6Ibi98XY-vFahgx64PhRIaVUyMzyI4ilBfrSRU9ilmdWZSV-KhJWFkddYq_Zr6T2-12LQzvhciogecAtrYyzYDUy4BCkZo1jeEbZqIXaNq26ZX9ypCm1KDZSxFTdHyC7M8-tUfNqyHFNAc5M-YHmx9GiT2RIWYtZVRTBcAjvhJuJL_16gqQFJEbZ8px4djKQipbQyrKUVMSnGCHBFcs8Jdgw_QiONWZAV14U39d3fufPikQcWgBwPqxE0ZVFCNh5bJpeFBRPE-aonMGsMpNWO-4WAHbdumZVVjegmRSKQQO2VcZtGxENnmUUVwdMA64LM4wNaUnvXhBEmfgVF9Ygf3CwNxFsQEZ-pGVaCgP1jw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://essencestore.official.ec/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'sinot.clothing',
  '54-1, ５４ 元代々木町 渋谷区 東京都 151-0062, Japan',
  'Japan',
  'Yoyogi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6874334, 35.6731461), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'sinot.clothing — Fashion boutique / clothing store located in 54-1. Info: @sinot.clothing, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cVmoE2jHcAMegXy1eRcY91bumiXsyZ6BV0dt16bGwbKdTTjXhkRjxn-FkXuGrrJAt9lXHZ92DT711xGPREB5wex5ag2qL-VvFTGHafGMCeRVKx-fUgfW3dUkaUBqyq7AaJwwJS72clzut5ytlN7YsVJAsd9UEQLY1sc62VHbjxd5wDQMKlrPm04YzCLr_h_fb9VaVDThGd9ZNNWfeT7aZwLtsjHO4BwIthtclNPeI7gUY4fF7HKg_ann5zdFzskoJxrBRWsPxxkw-WH8OiqgCrVMFmDMRDE63Kpe4iG7gSCAyRnwtv47Qiau0Cy7BJBUAN8PQiTrkNaeuLFZVcF0bPpTxSDpjIkHKV3flRrXL1DwZ0CCdNCM6zQQYYa2eApkEXZ1HychLyfQNf6mVtfEDDPNYiZAJtPP3t0uKJo7j1W0I&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/sinot.clothing/',
  '@sinot.clothing',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Post-Antique',
  'Japan, 〒201-0004 Tokyo, Komae, Iwadokita, 1-chōme−10−６ 甲武ビル B102',
  'Komae',
  'Komae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5803846, 35.6373247), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Post-Antiqueポストアンティーク&kikyキキー ブランド＆ヴィンテージ古着 /オリジナルキッズウェア子供服 東京都狛江喜多見店 — Vintage and used clothing shop located in Kita.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ftFGJaIyPZn_zeR416Uiuz7ePl-ggEh-DMQSyRTU9j41Hq09jjF6ZOsFcCibXbskh0y2qsdmVGzylK74UxlQLERQ3fvqVUpQE1bkocFS9Z3kcf7G3-8qR_fOhnlQeU8m_bDVgAWTDl25880QWWpK6QK_RQTTY0qaoq7DjRYzWYyu9S90RNnB-Xxhj92748DwlY2TqaLfZffMEuUjFfJ8Dlel4yyVr8QgkHbVfgKJEWqRUG4RzR9n1cFOpG0S0TQPFwGwb9vrbzCyZtz9BuRpKM8Q_XeOKVv0BwLOvuOaET-_RQqlPX0UZlsPfxW_mv3gS8llxZd69UaTmelNTS3JGx0n8RHjVJsoowtO_0GDuHGvFD9-ozd0dpEBCgccaBl6Ee-GXZ6kd10DIC-uiSvGse33pFvmA2x-SFnRKOceTaBA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://postantique.fashionstore.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '古着屋C.O.M.P',
  '3-chōme-17-1 Wakabayashi, Setagaya City, Tokyo 154-0023, Japan',
  'Tokyo 154-0023',
  'Setagaya City',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6551476, 35.6424103), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Comp Used Clothing — Vintage and used clothing shop located in Setagaya.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Blend Market Kyoto',
  '153 Tokiwachō, Higashiyama Ward, Kyoto, 605-0079, Japan',
  'Kyoto',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7728981, 35.0045228), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  NULL,
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e8LUaCXI8MQt359304xO9_qDmgvBo75iADxzgTqGOJT1zD49xEdVcNe8h0-rEZ1VO5sUY6TpyU_CpTu1eq0xMl_0V3xHK8jAUXvQzjI2ybE5Ecq8SsLA7O8vRre67IFf6-Mra5HYIiss4YTOgskOj3mjRgmYWfZQWNDw6dyAbYV_P7ez2jIZmsIDnU54z8opFZyhS17uVMBMw6etFpC0JatFVabDqzeREbpdIOAFrqnwoZHYdQkFm-d9EAcLkANaQNBcpIjCboE-PtRSfjNtchBTeD0iBQnhhlLxQLxRYlsINYuo3pn1Ox7hD8qz9NKTVxC3tUymaRkeZuEMruL53ojMWMtarkdprGhXTma2m_v40FbifKoLH6u47xH-dRupTxHb2jrPA44Q-zpZlcTb7nqb0hK5ij-WpwMCBS1ik_qLGBgM0QPA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://map.japanpost.jp/p/search/dtl/300144159000/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'RENTON ARCHIVES',
  'Japan, 〒550-0014 Osaka, Nishi Ward, Kitahorie, 1-chōme−22−３ マインズ北堀江 W04',
  'Nishi Ward',
  'Horie',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4939306, 34.6738625), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'RENTON ARCHIVES — Designer/archival fashion retailer located in Kita. Info: @renton_archives, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dp9w81BQ25eVxXf2RZtbqJrxgpVwFDLyjw9BT3lEhTjQAVI10gkLDxW4nzaKVwAqyjPFbQwnoWELKoeelIaWrCAYAtJtKKVGdAJk0gJLvkdX5Fm2pajOmwHylpZyghHg13thDmqGNXe7gG2vsZy6S1qeo-QYgsIwfbGgWPr8W2p1e0-ixY6f4CGIXFp3fBtK0ZuSSGb9B4TmhyXg2_tynvD1ph47i-QvWXaXUTCwhQYBG3H-s54Hephx74XDQAxc90itO85NHBxRfRwZ-p6U5o0ZdJA3dNRgyo5JVIjEyiCA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/renton_archives?igsh=ZGYwN29ydXVzZ2tm&utm_source=qr',
  '@renton_archives',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'signal',
  '224-21 Tamachi, Naka Ward, Hamamatsu, Shizuoka 430-0944, Japan',
  'Hamamatsu',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(137.730653, 34.708325), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'signal — Fashion boutique / clothing store located in Naka Ward. Info: .',
  ARRAY[]::TEXT[],
  'http://www.signal-shizuoka.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ENAM',
  '128-1 Isshindennakano, Tsu, Mie 514-0112, Japan',
  'Mie 514-0112',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.5116552, 34.7466044), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Enam ユーアイ — Fashion boutique / clothing store located in Nakano.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'voss',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 2-chōme−16−２０ Flat1 A',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7111924, 35.6734898), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'voss — Fashion boutique / clothing store located in Shibuya. Info: @voss_tokyo, website.',
  ARRAY[]::TEXT[],
  'https://instagram.com/voss_tokyo?igshid=MzRlODBiNWFlZA==',
  '@voss_tokyo',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Branche Nagoya',
  '3-chōme-37-43 Ōsu, Naka Ward, Nagoya, Aichi 460-0011, Japan',
  'Nagoya',
  'Nagoya',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.9017669, 35.158853), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Branche Nagoya — Fashion boutique / clothing store located in Nagoya. Info: @branche.official, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eC1ArIDrtYAIHTkStfOTY0MZ8MCKM-wkWWSe1MFRq7QDsD2fduxBlDRXW7IlvmPD-TBQ5-DfCyjkt09YimyZzkoBCqQ_GdLTB0CSjLZG0X5hV1QQ9lN5bsWzc5t28ef6BULq0zLWX2EEuOlYtHs7MUYf9bFgSGfudL59dbJQP9FPuIo1ev04fMkzirAn6PkL8NjF13z-edKPm8hGMa_0hmr0EPB1M4VplfQjDgSLg_5mlTuMmm7bBXohbABJszzMd0t3DXQaL3Hn5o91KrLcls9DMroGks7g59pU6LAA95vr9sLaGJayZyoj78dZ38sU0ukUHAq-PLZvxDGuazPl6DDSEhgyhs3jQsh5OV_aZcyCQj-pX8kQ1_BiRufVeQ-2FSEHdcwiSJ6YnVaFMaShP7YKWgqh0xLQmPo5HD3ITsTpxxgAaXIuVnRrpIic4f&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  '@branche.official',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'fernweh',
  '2F, 1-chōme-33-9 Umegaoka, Setagaya City, Tokyo 154-0022, Japan',
  'Setagaya City',
  'Setagaya City',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6525824, 35.6561409), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'fernweh — Fashion boutique / clothing store located in Setagaya. Info: @fernweh__jp, website.',
  ARRAY[]::TEXT[],
  'https://www.instagram.com/fernweh__jp/',
  '@fernweh__jp',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'DISSONANCE',
  '1-chōme-15-1 Kamimeguro, Meguro City, Tokyo 153-0051, Japan',
  'Tokyo 153-0051',
  'Nakameguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6983224, 35.6468081), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'DISSONANCE — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fBGkr8W2kvfSMq3bljrPUNTOdqs0hJo1BMc_5mQsxl-xq65aDZlz2x3di-DrMn7Ak3DbKyXefRGj8KZ4uZJbSJgukk80g7tkBcV0nNhgZewSMpO62Ved588y2gxINsRK-gIAADcHKazl9bmvON0qqudkjg9w_4AAKDCVLGjALQ3mVGgWX1nnoX-3xswNtKANMdGdho9FH662haU1PcmqlgimD5EgX6Y7K9L-3Xwtj4bWRKAAQi4ezAab9-Bl1KM8aHQPX7a6it-OdSkWC4gsEobKqyltuAUxcIU95BrchBtg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://dissonance.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'sumday',
  '4-chōme-25-2 Minamiaoyama, Minato City, Tokyo 107-0062, Japan',
  'Tokyo 107-0062',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7184612, 35.6632463), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'sumday — Fashion boutique / clothing store located in Minato.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'anns',
  'No. 3號, Alley 29, Lane 205, Section 4, Zhongxiao E Rd, Da’an District, Taipei City, Taiwan 106',
  'Lane 205',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(121.552077, 25.0431542), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Ann''S 忠孝門市 — Fashion boutique / clothing store located in Taipei City.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c_V48oJxKX7xBhuiqizZWbvKAUVDb3Zpdy1uKP0N__mVngL4F-ssyEvpnFanH4Cd-LBhBPkevbKf8jVEb0qC3Fb3bwEe738EUnQCmfxx67ZxHI4v5pVw4RgBftdAxUUAGXLG3NYvt9psOC9FBuG_DULtgvjSBED7z-K1qr-UuSKt_cnx2ehTPUVT3Y0R1BZeToT5WVy9RpMVMJu1bo03YdNdU-Yq8QkNSx1mPZ4iVSYVt4qA74yTYkXSIheQh7I_rMHDzyIzMFRWwN6gnpN6vDBG98-vt2cpiaq5XpjgK_pA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.anns.tw/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '2headz',
  'Japan, 〒541-0057 Osaka, Chuo Ward, Kitakyūhōjimachi, 4-chōme−2−６ S.M.C北久宝寺ビル 1階',
  'Chuo Ward',
  'Shinsaibashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4993472, 34.6799243), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '2Headz — Fashion boutique / clothing store located in Chuo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2du212tftHh3LrGKmiqBq75zj_RXlnTCHRrpywmchvi76iRMvV629Y1E9AE417GIK0M-aZz1Zr2JFH3KKetIo0ClyLdNfEyY79Pa55INk3nsTOll8U8Gxe1ledbMuvk99z-iPSG5Z8sVS92A-4UQ3dB7PdGSl1h07K5PkWXFISJzicdRqdRTS3a4k2zVOGL1vaDq2xaIEsZD1MIrknfUFoORFvIf51g9SOsm-Wcwex_8tyuytg5DBJcbgKR7-Uh8Iac7HgjimnlTXgYdToCGMFoPh5RtpJwyMUZGXgrN8Nl5g&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://linktr.ee/oluburgerkyoto',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'awake',
  'Japan, 〒530-0005 Osaka, Kita Ward, Nakanoshima, 1-chōme−1−２７ 大阪市中央公会堂 B1F',
  'Kita Ward',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5040112, 34.6934137), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Awake — Fashion boutique / clothing store located in Hiroshima',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fYOtRx-RPj_Hyw5zbiynk1AEBzaN4H0BokJ0OfWIZoW5Q7MM4Tu_e1H84MHG2HWztth2gtBg9cSi0aVZfa7d3nqRv0u06bpJx91jNqzGqdQigieVoI9zi-a-_gCtlebUwhivqXzv3_jrqtX0-gmpgFCTHhIKgziSNJclkgNz-VUxR_MuA5SLtUK3sOYfgUZAqLs1vTuyeHKYvrQ2jYIWDR1aC9wHT3z39Hvn5bgtJ7VRwIuCcXX23HjyOc0dXiLkGlQbf4o-m2AWpGkBcJELIbYCZJHTkvciASWR8URkndGg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://nakanoshima-social-eat-awake.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Poppinsch',
  '3-chōme-22-15 Omotechō, Kita Ward, Okayama, 700-0822, Japan',
  'Okayama',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(133.9289423, 34.6567525), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Poppinsch — Fashion boutique / clothing store located in Okayama',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dQ-OFbq4IBPh6TkFhXDzjLZijmha8dtYMGj3Y1YXhvELFQV6y9Y4b29Np0DGslsAq52HUZOEOKj2B_O5RP6VksrN8nkQKm9vbgidvH9gVo9CslR12xHgx68t30FHZEs-kE3DLuLj-yvjDaAff9EolBjQbcf6aBuH6D6DFyzJTZUiTBDUBAdIViWa1l10tJjRniYMsKUxq_MyiCvBX2IHACVxkkoewswrm2oB5UF_3k9fhqYC9DHuidj1WizP0laKqrJRestgQYNqs1_YhzBg_t-ftxEbEZCP5b2E7vEZtq6Q&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://poppinsch.official.ec/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'SULLEN TOKYO',
  'Japan, 〒150-0041 Tokyo, Shibuya, Jinnan, 1-chōme−13−１２ 神南ハウス 2F',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7000092, 35.6639436), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'SULLEN TOKYO — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2futmkph6_MhYT2g0VtYH4vu_uYiFqXFpHlWvCDFRlgyR3vjX5b_zoGCaEOdcnrqDpSOT-XegB_TytMgbkX9sxuijkj1ahC-h6j3kyJEKVYyl1JMTU974TxYsEcl3zWEP_VOVwXiTJXMv0fSY0K3gHCU4PnKJdBZiRvWtzWDkMaeYivtNF0csxG2PDjPeLasb7BKRjdLrK5wv0dPuD6Yti9iALK277yf3LKjTDUdHyRhsNtpTZxodRpkbo2XjjN9M2K5xh9xnpTDU1gd6kpswPOLHrIYm6gTODycaG8TkhohQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://sullentokyo.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'NeeD',
  '3-chōme-14-25 Hyōgominami, Saga, 849-0918, Japan',
  '849-0918',
  'Kyoto',
  'Japan',
  ST_SetSRID(ST_MakePoint(130.3198903, 33.2640871), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'need — Fashion boutique / clothing store located in 3-chōme-14-25 Hyōgominami. Info: @need_saga, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2d31_wS7fvfeMNODZMgvTDP2Vib6HHOYwKdeBU5CqOK3XIIGF4mswib3VDTgLAiOa7qB_beJEkmDDDknp5ux3y1DlfPVtyBR6saqTR1Fh7tdUjgthGjQKQ8_rXHWf64qRBjDcauM8kvvS3DPQaE_1M5slSWuI2NbEMWiEKDRr3VJc9SYWxH345vMw4KxKTmQdXTa30JWuDcm1tnPa3qtQ_rVShnYSQkGV811KwU0zjZlKoBEuMwSJ4ZWOzL2QKnDQJ298IaTDvFs5ZvEL0rxQXWjxW5x84JlM2ZOio1utZI4DY3hGwjxLIA91iHPLrvVcLWtIUX5qLRSeYy5STj4z-KkrCoplBMiADZ6y18cvfgr3N_TeSYVZOr6vOiq7XIMBfiQZ9Y6MC5Gs6MP9IB3B9xbcXlc4oN4lWDJDox09extOw7&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/need_saga?utm_medium=copy_link',
  '@need_kyoto',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'LUSTY TOKYO',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 3-chōme−7−２ H +神宮前 4F',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.713128, 35.6710096), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'LUSTY TOKYO — Fashion boutique / clothing store located in Shibuya. Info: @lusty_tokyo, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cj6GgSPoMCXGlLyJBzxABy6xGgxAVSSkOeQHmmousD0EsIP3Dzdmxmk1lYiDuB3tcZTeZD0Gw-8LLnqPgY3L0079uDnpGum3B_WpbW8eynnZI1DZ-C8po6QlQ6FxGpaJnqzqVXo976zHxectXTjulbSamT7kOVcr3WtcDwK07b8Vdg03bsNf_oGbhvNK-U0oQYdQmXrLnozIKZ20Uk8-zk-iRqhSkn_kh1H5m72YYU9aaxYrYBO0LDEOUExpadgHQBRZ7ROcZUGx9rOsG9Fr4NyNtwZlQWj_Ecb10fdVQXtg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/lusty_tokyo?igsh=bHNrcXh6Zm96bDRs&utm_source=qr',
  '@lusty_tokyo',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'sirius_archives',
  'Japan, 〒542-0086 Osaka, Chuo Ward, Nishishinsaibashi, 1-chōme−8−９ 商都ビル 4F N号室',
  'Chuo Ward',
  'Shinsaibashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4982586, 34.6728441), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'sirius_archives — Designer/archival fashion retailer located in Chuo. Info: @sirius_archives, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cWMBh_CwSd-9V25i-S9agvKhYSQ48smTGTHs3w6e5GVMas0e8vYLrgtv40FDRm_8wxdyw7stcaWe021LUol48Meeu_h8kMrKRtZ0u51b4WhR5KgK7vxHfyboxn28pa50x33R7486W1k-b-mUij9nieB-e3ctu7P9BZ7IayaSZCpXfzRJXRuld9pGV45wNRvG2Re1fWRrsSnHZGRLE4Ij_4XvKIyUYsChD5H5CPBWe69wWBC5_dVOtlQRpe-4kL223Z6cmrSphijSOOr9WK-J1-Jb51EyddQO25fYcBrRGjvw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/sirius_archives?igsh=MWFsdmZoancxbDZwMw==&utm_source=qr',
  '@sirius_archives',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'KIOSQUE CC',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 6-chōme−24−２ 原宿芳村ビル 2階',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7024456, 35.6654858), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'KIOSQUE CC — Fashion boutique / clothing store located in Shibuya. Info: @kiosque_cc, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eEBn1F_X1RJwYcpatBNvDLrcDCh20sJ_IIqfxz4-XF9i8douRnk3h8XE3j0llEbB18irL3KJMBJqb6LfuIlSj0LSCxE1kOfIWxASW1KGUEEyYAN-xDmkqfpqYvzZWJ2-yoXKcleIv8GSXKfGnLmFUUR0VUvhWwfIurB5CRsKrkFPG-KdpKuaSsPzcSLWE0MJK4KMH-QeWs2_qZFwR-dDa6pAFjs10akFR3YECf-TiJH8OJTyn8IJ02UA8nVJAfLRQ82RR4qyF2PVGHb57GWgeJiwLxh_hLKK_JDivqg6qhfQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/kiosque_cc?igshid=YmMyMTA2M2Y=',
  '@kiosque_cc',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'HONEY TRAP',
  'Japan, 〒110-0005 Tokyo, Taito City, Ueno, 5-chōme−25−１７ 東成ビルB1階',
  'Taito City',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7755317, 35.7068972), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Honey Trap — Fashion boutique / clothing store located in Hiroshima.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cZhyYnA0JfMgdYp7ayvTLs5Q27eY1hOuWXhzJxAmW6CN-iFoye2bXZNLJpxCS2_xkXZSwl23AYJVmB_kdslaye8txSWuw_Tg1-1NdVf2IzC7P1SRLsHfWNeECpdFnlzYBHm3tl_4HZjsQV2qn4EWA9ioccbvijLljb8ZEtia78Q9UiU_lfAq2Pibk_Z7d6dCgWGt0WdOkn7i3W7JAvxB7QERNIs_7nhhsVBnEEndZE7AV3BCPkQlnUyfKHAyQF1Ry5ZdoqduZPbHGOvHwSglwYNwLjBHpgS47r0z-QHuPiWSpfoETefsUx5cH8lEAt_xhppkshKE-KRKBpkYwr8NVD-ko8hpnRN9uxLR5-9-VRf7n_N299eaY3Ut93OE_xeVlhc5jliXD8TkFA5hYCCduoEGNIYQdsdQ8r5c33HnUmedM6&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.bar-honeytrap.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'seam used clothing',
  'Japan, 〒150-0002 Tokyo, Shibuya, 2-chōme−2−４ 青山アルコーブ 404',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7086502, 35.6604671), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'seam used clothing — Vintage and used clothing shop located in Shibuya. Info: @seam_used_clothing, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f5CDdWPuceeTIifZRdTWUEJeRMRiyxFixQNnuwDP-kqWD3KxQ4lvj-L5VM4rRP-sls5_4Jgt5z3CdrIJNd0EeReU4h-3zwepjt3Z76Tb4cG3AGHlm5ErHIGm7jeoBFKoeCV6kFcZ80ysGEkST2FX-M53DbAnRufL93C9pyg89_bA-l_GdsEYmH6iHbd1YR5wxLcSXXt-C7jxhkInmDfMQcPxIo4RXPgGckBx25c5lWN49SSi4-vtU5K7rGdbLHv0w0NCu1Ft6ovg5yx5gLNCvcTrm3uu9eATtwV4WReJpejw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/seam_used_clothing',
  '@seam_used_clothing',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'LOVERZ-10',
  'Japan, 〒810-0073 Fukuoka, Chuo Ward, Maizuru, 1-chōme−9−４ MODERN PALAZZO 天神 NUOVO 302',
  'Chuo Ward',
  'Fukuoaka',
  'Japan',
  ST_SetSRID(ST_MakePoint(130.3947911, 33.5919086), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'LOVERZ-10 brand archive & used clothing — Vintage and used clothing shop located in Fukuoka. Info: @loverz_10_fukuoka, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dyDKMDr7_hCYmU0Ekw1hQrW2o5tRXr8ZbHXyyrc68utJ4X2T2sATeZbpUVLk-KYbg9u-6GIYrKaO375VT57VwQzUGIBtzUPDLhRi1_9NKxUr30bnWOi6KSN8GCU-DKTDwGJFbsodhmkcgj-7yypISmTvU55oJm2_QKWXq0inJFkj9dB4ApvTvEvilCOZX00qYDNRBhm_sJUL0U8tVp22nuaAx--ZqTXUk1PlvdDJ4KRsiiM_wKl8gCgS5T_BAwy4h2SyvcXDgLplIXz76ohPAkRqwhjFmIgKzUNlY8sFM&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/loverz_10_fukuoka?igsh=MXVmZzRuYWx1MjY3OA==&utm_source=qr',
  '@loverz_10_fukuoka',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'dude 原宿',
  '神宮前コーポラス 14階1405号室, 6-chōme-25-8 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.70299, 35.666237), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'dude 原宿 — Fashion boutique / clothing store located in Shibuya.',
  ARRAY[]::TEXT[],
  'http://dude-harajuku.ocnk.net/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Concept Shop WTS',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 2-chōme−22−２ FOLD BLD 1F',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.710644, 35.6749917), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Concept Shop WTS — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f2845caPa9jWxNBVJYaW3qYHShu4arrS0lcKJmdZ-Pp59IZ4EmBz6Xwz4xaqQd1NBmPThZFbNIleWPdHnNi0poABv1Em0HSIj8-YkiY7478jZ3DZOir5OBMuZ_Rof3MGNLgmaLRSbWEt_bJhJ9RuzrnXyY7Cx8mYZBDWOgUO3tYi1tENDTOcbd-AKImR7Rs-89aKkH2VtUSE1xt6pISU_QDPPV6KuxbwoCW3CGe_9IoVuQkXhZzoT0HplaX1MiEXjzL57ZVc3AV2mhsyU8SsaZawdlnq7RzmqhvDmesGKE7g&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://wts-conceptshop.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'The Ten Harajuku',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 3-chōme−33−８ 神宮前マンション 202',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7109789, 35.6719353), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Jingūmae, 3-chōme−33−８ 202 — Fashion boutique / clothing store located in Shibuya.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'hundred buyers',
  'Japan, 〒171-0022 Tokyo, Toshima City, Minamiikebukuro, 3-chōme−13−１６ ２４－Ｈビル',
  'Toshima City',
  'Ikebukuro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.712419, 35.726201), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'hundred buyers — Fashion boutique / clothing store located in Toshima.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e-snZ2WIsr4wUEJKklYlYKgdpYPgliU8KVlcZYJ57Q6k8-PokiTn55MQfQ2ekondlqFuq0DJQ6hpbyFDetKrdB3146uuy2r_AuU6TRzMYZktUU8hsOw9yfWAq1DPbuAtR1TqrOLnTnpa1tBNr20uMxD1yE7q71OKMMcXeu8FNurwGuId0CE7rpTRlbZjor55349Z3zbqgTm9Ia9IZkXAGi4hb297GAdA4-PQShEUXLx5RZOCc6u4x-sS8CbmAu6NB8aowz0ACbdMf99LoTwacAJ3-Zrxz4Imb0V7RXOvGhjylmHw9TDGqWS4y_Ycp-x6aSdHVNV-gq8Mp5_Zh1b_cva18HG0v9PfwW0zWiLobPViTsr4d-jKFGFFtwAfIWF2UxrCODVEISNepxb-sdCBJ9eomrgat5uqrDExojKt3HtpqaIgFIiy0tvwbZfb8z&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.ohb.co.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Bay Apt.',
  'Japan, 〒136-0082 Tokyo, Koto City, Shinkiba, 2-chōme−15−１４ ３F',
  'Koto City',
  'Koto',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.821649, 35.6392742), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Bay Apt. — Fashion boutique / clothing store located in Koto City.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eMgsf52dDtrhCxciulIfGyNp1OetUMVpvMP-NpaQ0FpG7Iwp1ieP0ILg-3XglgVrs2sFngp23UEKNnrNWo6L3HRw-T5EVnLUTy7MQFDAg7hMb2-DOZYYQ-WVH6UiuJjy40yj_UAc4bEbJCvAtEeoGM1QO77GpOb50d2_n5ZsXX6neEe7j9NH2LOw_ZNP6NIuJqp_nL8pLH5kbMEpd4uv_DYL2Rvxvuj3HXeDXhciJkEHwz4t6GlZ--VsDWS6Zy6DQSonFUZ9M8elEgow9Au7ct_97kRHtqR9vyWbUHsvD9GRff0xLSTFpXYGY0Y9hUw-yjf-d0SvPOlE635auSF4tk769rx6OvompPY5DODLWRBANJTPSLADygVcUf6UytCRT03yRc0Ng7WGu8Qe-PyURzLvzRDIIPpQ1yn-sZ5GEK1Q&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'EQUAL LAB STORE',
  '3-chōme-39-29 Ōsu, Naka Ward, Nagoya, Aichi 460-0011, Japan',
  'Nagoya',
  'Nagoya',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.9022438, 35.15779), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'EQUAL LAB STORE — Fashion boutique / clothing store located in Nagoya. Info: @equal_lab_store, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fFUpLB0FBxvkx6f6xlS9jf5qj3Yz75fX3vIf5MAoqYEZ-wjivQOvK7Oq98cdnSk_fdXrvhxrLW-7JlS6EX6gm74p_gslo2DXDtkfH5BiHcPvNV48Igr2625In6kapOYvwywuyoP6ruoIA1WKXmyLveXUNRDd8mJoIJBDUljutw2_I0E0pk0RunQ0HLTk5cnB15-Par1s-vPQbxkAaIXpHPn7HQvqXNIBCKGVZ2bSTp6CcnP7oHRTa4SdTh63fZsGdXfkhx0luv95jK5zgQVKJpNUNplANnYnxJt5LLkL8CrLhRx3tbt2DA0_M6FOjHzyTPiqqDgMu5yz8pdGJ3ANYa253nkHJW1_PM6YZOVjFQ6lZIN0iefGzO9elQxxaUYln6z-uT2CR_QHv_cG_McHy0x0jP_zZ5KmdjxZhy1CbIoA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/equal_lab_store?igshid=YmMyMTA2M2Y=',
  '@equal_lab_store',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'SQUALL _ TOKYO',
  'Japan, 〒166-0003 Tokyo, Suginami City, Kōenjiminami, 2-chōme−20−８ つるや店舗 1F',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6477066, 35.6985293), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'SQUALL_TOKYO（SQUALL） — Fashion boutique / clothing store located in Suginami.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cMQRNTac46Vuw34X5ZUhCTjZ4n7EogVdF9-9nz4PsrPX4arA922glgmOJsaEU6WdpNlQQ1mdxS_YrAKM08Wxd9nW04ZydOE_h23RdiJf58QA06gaAMFe55MDmjz2pP-E66H32Q8n8XIuZGMOpA-le5DneIh7TcB0pmCWRxtwNpq7QTa8ZogUlcbMF4zw-wHjG7Id2uFjh6e9XuEdeHSIE9Cim2_9D5ddgcU7Dh8G78uVHHL0_uDUq68OhCpiUldaE7Ptk21WOYXfZCPv5osKJYOwHy7MopRSG7bwqwtY3Oxw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://squall-nn.stores.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'JizhoH',
  'Japan, 〒550-0015 Osaka, Nishi Ward, Minamihorie, 1-chōme−16−１５ 名城ビル 7F C号室',
  'Nishi Ward',
  'Horie',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4948174, 34.6706159), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'JizhoH — Fashion boutique / clothing store located in Osaka.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c5MUcoIpwjM2E-5LxnyMi7Tr5DOLWkrSmswQeJCSzozswxyZWX-_h2Wwe50cdeU4hgrmaL42uFtqT2qIi7QNQeeoJ8UcTwrxWB7Ucf5IeKUuFSIPK4vk8gm7EbhyQv6Ux43WsQLAjlOzyO1dxnJtdPsi0vyTer3ahAdiVnAw4LMBnhuLCZAGkJd4nI59bYfdIqbiYef9qaW3caSMFo0SezNyxUJQx7Xj1KEW9fsZiRUjYS9k03degZpU--ivxdu7LuEiefGjS8xW-DTHSAvqiX_6ZOPaudVJJjjBrAHEplmYM_ePSjwyZDeVbksU0V_vMIU5Up92keXbkohZJUDQN_rr8hiG1efPcSxtTta5lbZYpbxs5_H2j-7bENvIBheOG4cJzyexVo2He5De-Kq2XZf6qJDGKJFvGDFAAZrgm1ED87O4qaa388a0tpK9t7&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://jizhoh.official.ec/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'LeeLoo',
  'Japan, 〒150-0041 Tokyo, Shibuya, Jinnan, 1-chōme−13−４ Idoビル 1F-B',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.700451, 35.6631787), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'LeeLoo — Fashion boutique / clothing store located in Shibuya. Info: @leeloo_shibuya, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2es86_KsYIW6s6jtgrGkYiDjRYl8UxHMrZJKUaUQpRQLcRKhkgnAfPjTXRb_jXH_FbCK4j0jgBCqn61tWBiqm5biS5s4H80nVAvNw5HVZa2ObWW09XQGBBzc8rh36HmlOI8iGz8pbKRGBL4Lmr8-aK3mf5oHEZ6oxTLhJpHQHDDQ-4gE-r2BKQGZlYLiQ8ttnKLeHL_OZ4G3pyJRhuiHmRrslxpbRNBbnNvA1ell13Q9mpKT4SnhMTm1fiUk_EnX78BcWxaZBTmlJLROkxtazZ1ge_AjFVvR5RF2J_p0Nim7Q&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/leeloo_shibuya/?hl=ja',
  '@leeloo_shibuya',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'mushroom',
  '5-chōme-10-28 Aomatanihigashi, Minoh, Osaka 562-0022, Japan',
  'Osaka 562-0022',
  'Niigata',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5178115, 34.8451947), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Mushroom — Fashion boutique / clothing store located in Niigata.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fcxsH6EQrKYo6NSnN7Hw8GYjAvh_dUPgR_zgs_eGi6npcY3W4bLwccJXuKfftG8vQeww5WAJVj42btdP1KRk7-Ilk6DYhCyU1T9y3FqCGq476N1HkW8jvqXm514Aexve53PKz9A0l3miewLImW0JHgsJ7l5mTD3RG4jptacGTJU4fHPk618KG5MUeww8R53zVVYGQRRDknQ3E8_oQsO6xJnA8cxfOjnPj6bO7dN4vgXIltZu8s8qt1IaQpaMAolYLBzedEry-mQHaMUCy7fHp6rBG3xpJcsxGkMXSk6EYhQQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://mushroom-minoh.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'infini Dress/ アンフィニードレス',
  'Japan, 〒730-0036 Hiroshima, Naka Ward, Fukuromachi, 1−２６ マルミ袋町ビル 202',
  'Naka Ward',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(132.4604633, 34.3921323), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'infini Dress/ アンフィニードレス — Fashion boutique / clothing store located in Hiroshima.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e7Wk8uU0F2SJWwPxyLBY-6Vuk0aFmDYCiv06XhzwTPo-b8CbsOy0I1aNlcat0SMHVDebHTVdiGYpbSBJFyt41ovWsiDdw3pX1EfZ5ltlFr-Uq-EwO7jeBI75zvZ7RP9Ij_AtdaFzNOKhlYXwgErA11bpQrTv4hWu2FCXlmycDd3uWfXLV7U88hVL4X_3AZuW9696uZn_u0pBty6EBdFz_0eWquBvqgHEIO20jh_-DmyCAkG21so6-K_BBpydJ6OoiNOTR1HqxYC_9WYOy2zZhsuy77u11JdQIQiIu0k1YtTg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://infinidress.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Rat used clothing',
  'Japan, 〒730-0034 Hiroshima, Naka Ward, Shintenchi, 4−８ 二上ビル ２階',
  'Naka Ward',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(132.4616034, 34.3918213), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Rat used clothing — Vintage and used clothing shop located in Hiroshima.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fYLwrvibHtu3CafCFeJwEFZuZkkSnBINbDz-PlzPujojk2XfMQ_pnfrcR8dMnmF7TyI0CCoE1EdQ0qrU2t7fMuXHcTntOUHy4VfCn_teou-vlPeS_kkpetqNyTdhdngMtqwkV5lQcvIsIkhggX41Ozbz2h81ip0l6F6DnlhW6jRbUml7e0lexZiXYs1zocA6Xpc7MeozNG_Rmnhv7okwYhjHowL4tqNgr9kMQCU3nblbotLtEPJS_AY1hxp78DB2_ZdHiCfnwaXOiNcsCLkbyFArWhuzo25LvYLberoNzAZXRXEJbJltSYHIzbdkSUQxpDDCCV_jjjiFwY54rOWhsFHO6JzJil9WSz2gtLR4drqJWEL1c-Y8HOhvCl6otfd9h3stZHQn9gTEQf5X8k0YOJhbQu4g4n4JYUWqKhP0FTOus&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://rathiroshima.thebase.in/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'kagamirock',
  'Japan, 〒153-0043 Tokyo, Meguro City, Higashiyama, 1-chōme−11−１５ 中目黒ARK-2 304号室',
  'Meguro City',
  'Nakameguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6920811, 35.6482457), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'kagamirock — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fZIaZfT9I60tJSKvuqXBzMjlrnCPpraISC3_C7dGf6Y01oG-lA94pE4U4086_T-yW-r76nnldWnYd4dbU0aO2ZAsyMGtCpTgGwCWMULi5qSIkaoaxcEZQWjHv95xzkJRAyUYwNZPqLkY6H9j7JiRaiaOt6xcV8XsRWZmtT6VDicvFs14HH4mnq1gn4lYfR-VqVvTs6HyhnVatMRneO6xcbZ4S2CF6S4sk09lGMjGA7g5RTBdCgYJILRkIcM0KsfY_ThW55qaryy8YcKbuBlux5Ethjhq1FYPEhde52TqLSWPwVhyWOfIMS2bc43-XyXOCU9HlM9O2puW0Zmn8DUR3GoHEdjFBSvTAq7T-IiBxCnmKqColPcAaF8DPSib6cWiYzduCJoP9fVS4b4q9Zh3krwgEL6wJDiQK1RWERBG89Iw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://kagamirock.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'GUILD',
  '5-chōme-12-5 Nipponbashi, Naniwa Ward, Osaka, 556-0005, Japan',
  'Osaka',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(135.505488, 34.656782), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Entertainment Bar Guild — Fashion boutique / clothing store located in Osaka.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cZgGfcFLXeuTDw4vsNkFMvcFQ7nUMXP6SQifbwRGAn6axHlwsTclnL7znBcBprLLJQx9I3swMzo8N03jqjbpDNrWJjbgC9ZTztBkarY5Yro1SEFEZKhr5I3D6A09Fdu2bzWbS52t_nfepDdsVMgQdMA1YfuAzWUCMz8xZZX7pMHbN93X7cs4vDhlq75jvIAyiEB7PaurVXKwEnjw1H9Rn6z_5B6xslF1qNXwQNeXFg02ktN9rNXUKD1t_J7Lue800B1xwHQm3vFiuD3xA88omTCPFI6VRDevmTl05_4bkU0ryA-fOnwGLFM0gzzNIH7flMmlV2dPGum_LDOY3dj1M-I54bFKqNudpQBSbtYPpipt8ypFwrASjU9YqmB5kYLcfQnBrg1BYLRucig-wghR3pbjYncOipTXH-2IKhoYCNOP4&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://barguild.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'gamu store',
  'Japan, 〒963-8011 Fukushima, Koriyama, Wakabachō, 19−１３ ＣＬ愛犬美容学院',
  'Koriyama',
  'Japan',
  'Japan',
  ST_SetSRID(ST_MakePoint(140.383799, 37.4056509), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'gamu store — Fashion boutique / clothing store located in Japan.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'CASANOVA vintage 離れ',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 5-chōme−11−６ Ｔ’ｓ表参道 １F',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.706656, 35.6667571), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'CASANOVA vintage 離れ — Vintage and used clothing shop located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cR2RS2Ld1YX7vlqLuBQ3_IvXmALPKG4XEJYFp45CM4Qe7XSaaRCntLz5uvGfUHGKxYQI_DoR7_GzYEOwY-LAuC6XZZoDgSpibdjy84oJ_qgVq7oUnCwmmkgXQjMjTXyggXQNmozo2jhaCC9Fz_MxyNVuCn36yKIKkwEjnwJ5owyquLHueT57F19266wNMXVKUJB9sbsKKKViV9CKxNB8rC-8aBsxR3WpREYaAI_FQpxe5BDt6vggS6TmDMzNVm0X7dJ33LXNrklZlKI7EgxjzrLWkoptjc8PHivS-cMdbDWw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://casanova-vintage.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'HYPE',
  '501-9 Higashigawachō, Nakagyo Ward, Kyoto, 604-8046, Japan',
  'Kyoto',
  'Kyoto',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7669549, 35.0060037), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Hype kyoto — Fashion boutique / clothing store located in Kyoto. Info: @hype_kyoto, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ebtFcPkglRbrE8k6E8RR4Fvtc1-mz1PPbv7M19F41f1NCvlhuRfqa6QckUQOUcgJ8HR67gCb53wReLRtdKK7M0H4RFt-E9hr5Dw7Ug6mRlgNl_MOqsXEG9J4QFUMF-mjX9d_8odiF6UMOnrh7ne3vW37hL2bK1bnfHCRYh1nKuLqP3HBuHg2YYYJ8wfoVgUgQ9I4R2LmXO_7y3eS3Gy2BEMqrCVIvM7iT5xk-gymDO67CHbxlQbJjFxA4reu2e87LrnSYa_1tDi9Z8Fea7DjKYG0nqFQY8vyvbmzWbPzlD-ySegQQohvNK0MID8ncuPGE-6WvyNdrmZs9QbSiBxXqbqauSmoykhu9QZOlPtK5kOMkvrJYIg5cKDNMrXSCymCd14gwEMrFlEzIeDA8-vO44FBpkLiv4nzG13iLqTo3AqQEb&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/hype_kyoto',
  '@hype_kyoto',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'giorno loobus',
  'Japan, 〒530-0015 Osaka, Kita Ward, Nakazakinishi, 1-chōme−9−１２ 飯塚ハイツ 3号室',
  'Kita Ward',
  'Nakazakicho',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.503517, 34.7084641), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'giorno loobus — Fashion boutique / clothing store located in Kita.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eMP4UZLRt1TyeAGqjAyaOnEq5I4kzyYQP3HMTFdPtmhQ8OJd_uS3tAIcgz6LSIz9jotGvxRsZebEbQC4bwGXGTpAhD-yQprL56-btka1PwbiLTfecW_9SJuV85Q4HT6H2MP3mTQy7um4jgiTnHV2By5KIn1Hxghca780XE31QBJlezbZOfcdlo0CpxSukEjEQACzoQsn6v_MG37pUot8bIEBVFnpGSL2XmWrcsiVhMtetMnNU43tOW_kxDeceBXYKy59sbRBKihbMMiZQSADTS-73Turs9WxwYd9kux-dZkfqTtU8ez71em0vOdbNoFa11qFjvbX7WrTtsZO-Ym0z5MvXghFBe8Yjc3G4P1uS0QkeZrbNxMjjTKAkxjOuqFaD3wrQ3E227qDFawXlh7G1kt58zFmlCJl4fjbM4g0js6XG-azi7aITmMabvbg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://giorno0903.base.shop/?fbclid=PAAaY5HpC2wy5VaaPnSllOYNpn39EZvqQYdDn75gu-dvpe7X2pCZUHcEzPynY_aem_AYCH19Yd4dbDiVpdLAAttV-hEw2dx3bEk3FQRdTbP8ASuKWCo2j5CH2ekmhH9Pty6rw',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '6 ( roku )',
  'Japan, 〒153-0042 Tokyo, Meguro City, Aobadai, 1-chōme−27−１２ 後藤ビル 2F',
  'Meguro City',
  'Meguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6942761, 35.6477692), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '6 ( ロク / roku ) — Fashion boutique / clothing store located in Meguro. Info: @6tokyojapan, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cdDYwJmPusWm9S7ZFY9rzRal9UsN0dl7Z56sFVFtAVxyT5qgi-sNKRrcGI5vsYYKOgXVAYQobjQ0KBjj1PTcCXuc_HTzktuuraejDjvO5IPy1wK54bxNn3sldQXw4asc4L3Zp2VwSu3AUgL5YQbFWH_NmAdyHlJNhPMw9rf-PTNhlKPTpK_cQPabIc_GsUzlOak_32pPjFv5EkTrf7i_tUgy2MkOX55sWnR3c2Q4lbSKxgABhyNdzcEkLNDLX1udP1aOg8Egl_eqaDjnJA-bx0-O6d-syPpb3H8VhiTaZ_oQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/6tokyojapan',
  '@6tokyojapan',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'kame',
  '50-1 Kamikawarachō, Nakagyo Ward, Kyoto, 604-8374, Japan',
  'Kyoto',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7477395, 35.0084324), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'KAMEE COFFEE KYOTO — Fashion boutique / clothing store located in Kyoto.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fkB3ocq7ItlBeu7yUsEm8w_mV-DzxVzfVsd6jyi8oHBAVPQBscOzKWFDAZM7kqmKIpvZmqNBfn4q51Eh5aC_-qtNm7iilt56iQIG_jp-yyyQQ1L1XkSiRlj23VtF6LbFwbveisOkvfC897YVae9F4rbPe7ZlWV-meVeb_xB7_RkF2lwdgPm-Iiqq1tHt78e76mpPisF6gf0bMlxxIZ0hkv6BA2MVlPMDZECHaGkjcpHkmALLYCQi4vb_ryVHxkalp9-3akHe7-Mi_4fF1Id6bNPc5BaZwHFsvQQQt_0lm6j2g8beXbqvkP1mrhQl0i4OIAAgS2pH35-lQQwlp8_p0oYGw8A4opfhDzdrbMb_8QYe8uWAKCGg7uNBLqTVke35MFlyfFxwoSZDDxiyyqailUWmNfbRLOkbRQ6BoketFSMw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://kamee-coffee.co.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Qont',
  'Japan, 〒150-0041 Tokyo, Shibuya, Jinnan, 1-chōme−10−７ テルス神南 202',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7012488, 35.6630689), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'qont — Fashion boutique / clothing store located in Shibuya. Info: @qont___, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2d5xr9HI0RRWkP1CorMTTh_1HP1YtBXsRFp-CDeT5qF080F5JRynsDYwVMKN4q2IQjIXT5Dj-hbr4CUKEq4w6gAsKWq5Y8r7hGxNavUJqbXh38p3d_t7FIzyQhP6IO3R3aAlaMe3JR9ZlKAXL7ycoOl0tTQt2azVowtN1XSDBCh5maeWJ-EFqHC9ZHMH1bmq623oCYolHw2ugYjT7lYXcRZonpwLseDHQG3ouYWQOf0is5LSynEUZyo4Z0zM9Y0Pj9AWkr127JDzBr-fj4mPdetvHASsGdPFtzdWQj428qBvg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/qont___?igsh=MTA2ZWx1MW5tcmRtNw==&utm_source=qr',
  '@qont___',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Wynn Nagoya',
  'Japan, 〒460-0008 Aichi, Nagoya, Naka Ward, Sakae, 3-chōme−25−７ 食器ビル 3F',
  'Nagoya',
  'Nagoya',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.9051992, 35.1644108), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ヌーベルノーム — Fashion boutique / clothing store located in Nagoya.',
  ARRAY[]::TEXT[],
  'http://nouvellenorme.jp/',
  '@wynn___nagoya',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'NeiN archive and select',
  'Japan, 〒155-0031 Tokyo, Setagaya City, Kitazawa, 2-chōme−9−３ 三久ビル 2-G 2階-G',
  'Setagaya City',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6688267, 35.6622988), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'NeiN archive and select — Curated select shop located in Setagaya.',
  ARRAY[]::TEXT[],
  'https://nein.theshop.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'KAKKO',
  'Japan, 〒150-0043 Tokyo, Shibuya, Dōgenzaka, 1-chōme−15−１５ 9BELL BEE2F',
  'Shibuya',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6974233, 35.6571133), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '（）Bistro kakko — Fashion boutique / clothing store located in Shibuya. Info: @kakko_shibuya, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fSmdIKyKbIkgDkaow6f4XdH9gjizo2OcmFR6fQKi3ba48h51l2AaMhg56TzgJ-nBTDN4f19SBh77mfeSz0zZpMS80zgRPopVtduN-CSuH-ViZUq4-FmA4MkgO5w01Do_msbdfhgi_8e2YZubDlnSjBDOhXeiGyAL3W1J3jg5oqs8YQmjFcI3OOcUKbIIxGt8ivhVJ8tBMkc2oUZhvmExLHtV_YbZmkLe9aZq9RKRsx293QTlqvfPclPqjGVvWmEbnkOdDU4CdH97oYNUuD297hH4EwimeYNsSJ4wVKxbC2kg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/kakko_shibuya?igsh=MXZuam8xN3NscGsxaA==',
  '@kakko_shibuya',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Carrefour',
  '2-chōme-15-13 Midorigaoka, Meguro City, Tokyo 152-0034, Japan',
  'Tokyo 152-0034',
  'Jiyugaoka',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6730928, 35.6085069), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Carrefour — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fID4h8mwNAUSNINHHdjDxwk73yylADlP4kghxaInzTXJVZdqJTt7mFZVwbjOz8R-pUKTeKbSWkvmXdgIky19AEjk-OKP7eLpBW2nyYPOk9mNRDhVFUPj04SFWekav42quZeRJmJXh3cOhl-ZZyiwB93JwENHf57KfD7GbLKIRsvT9zknjpMaJ0C-1rkSQlbGaWS-RYJKYA6hD7lrmkjd9zg9cHu6Nl7yfhceMetuT1pEpnd9HZ0_Xh7r5MrOi-WbN5ehT854KaWemQWjdBMypSLW5Jcq0A2CkDeaKPCenbiw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://couleur-ltd.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'EROTIC',
  '3-chōme-8-１ Sakae, Ichinomiya, Aichi 491-0858, Japan',
  'Aichi 491-0858',
  'Jiyugaoka',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.799336, 35.302448), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Private Box — Fashion boutique / clothing store located in 3-chōme-8-１ Sakae.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dbmGPaj6BILN8_cL02zbD_uMb_scDVij3IKiaKVZPYUln3xv0wL7MKRN4YeBG9nvaMnjoAKbmnsqePpHQE1gsKqvU2lQAx1R2wrCPUvNapVUgAnFemu_3pF0zUI5YJ1zQ50ovMlLIkxbpHLV-flEOnul7Cq_DEtjeBSHeghPyIhxSeIgJHussNNl_zJx9FPYjoqBTI1aRrw59gfxDw0G_l7qirNK2Wl506ToO2ZbN-5xdaeZpCUmnogzD-MV_IeVCADBt6mzMdYp_aRw6k_cdsaCrYzIivhYaxubayOY05gw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.cityheaven.net/aichi/A2302/A230201/private-box/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'WEBoffline',
  'Japan, 〒152-0035 Tokyo, Meguro City, Jiyūgaoka, 1-chōme−26−１３ キューブ自由が丘 3階',
  'Meguro City',
  'Jiyugaoka',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6684944, 35.6090757), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'WEBoffline — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cgtC-Kc9mMIANqg_AQ4fiI1IJQopZkqQ4HVwSIbCp8iwyphFw2jVqJLojQvf68I0hhEcqxCN2twYxmjU2XYQDQ7TN4Wq4Zq4Et1c0EtIuCa5eYz9Rfg8H4TihI1Vbe-kDr2VXxq9dGn2a-fv2FFmXUNMdRxWj-A0H02f57k8bFB-baaGJtxJh581231tVozeharJ3FXoHOJVC4lCZi6mOu1iNxTjchZWhi6447kXpEj1YKxdxz5ohTzIZxgYkDODY-se9FrzBuZmnJMW4lX9A52UQc5PB6bVKx2KJVX-7TvNU1JLylZet9oB06iX3xvTCeZsQFzwWZV7CR0jAn-HVg4Tj-_7hbspdfKojWT0adlodN08kGUjwFXsfmaoaZv_JzsdVafQF3GBjsfkO5G51FFN_0GAsZnRA1ZpkSxteyPQh6&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://webofflineonline.com/?fbclid=PAZXh0bgNhZW0BMQABppzZwveWPGCdQkoaWvVsOVLxSxAfrNaG5Bgu2fnG64EZOoibaba_rIUK6A_aem_Aazb0Uj9wrN19UZXmBRq64BFZVjuQlzzITM11cSBmsZM5LSWTsLglrUJlYmTmCm5M2k',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Archive Store',
  'Japan, 〒150-0041 Tokyo, Shibuya, Jinnan, 1-chōme−12−１６ 和光ビル B1F',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7004355, 35.6625985), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Archive Store — Designer/archival fashion retailer located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2edY1rPHNr1C87z0_midXAPy1x5IfLAACb-iCBJ6mytJS1YtD13zs59xePO8W7_VU4OST-CtH3d0HEBSeYJC8mr2_zuK9fBmj4an8euIYH2diCmRHfs3Uy2NPQUcZp8Qi7b9RLue6x8MLWitw45ocgJO4KJqCq3bfwt7vAs2GlSeoFvs3DeU49yKcVG80d94hoJtto9P4Xs95ps0_BptTdc-6bJpxFFiIkTPoTnyCoseC3isZZ6v93t97siTy_Gw9nOJByuN78w-XHomeCTvf1CXcf8iw1d5GawK6iTa6KKAQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://archivestore.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'fog',
  'Japan, 〒064-0811 Hokkaido, Sapporo, Chuo Ward, Minami 11 Jōnishi, 6-chōme−1−２７ 山幸ビル 1階',
  'Sapporo',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(141.3502727, 43.0460953), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  NULL,
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ePh3iXiRnq9OyaU-ONIpr5gU-iNonlmlBZnOKWoHVU0Se53fazwGeQBzDXJr4ValXJNDDRlUvFDJBf78ZxCR4Ne3cc8sze1uSHoEPB4vgoSgQbHjAPvYNbFkTVWOt0S3xGpS-Pd6Tg0VsomcLAjy4he0XIBVMdAM9zXC4cbZfPUWgJkCsCZE--JP4S0k9JJSr6Ta_kYBvMSnEKRgGHpmavhaUXdhrRfBDJx_eXfz_XumkB0koIs8gscd3BFxl-sp-uKaBLMxscZ-VJxb1e19fx8vRl839A7PUiQbqNIesgTw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/_fog.coffee_?igshid=YmMyMTA2M2Y=',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ONtheCORNER',
  'Japan, 〒231-0023 Kanagawa, Yokohama, Naka Ward, Yamashitachō, １０８ 小黒ビル 301',
  'Yokohama',
  'Yokohama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6497725, 35.4420124), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ONtheCORNER — Fashion boutique / clothing store located in Yokohama.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c9GaWarwPa55-oOmLKG547_bdutj6KxANqM2wN7jUtkTyFQN2MJ_U6Ax8gzzS7vNHPs3b7kJdktZTuBdU6Ly7pRmAt3rqglYijU8siwJlXi44iGo124RNfZKf8rHqhZYmKTLJEpjCxGkuJl2VoGubB0lXEFKar8xZA4SxWNImboeFFczBERoXhj-VoRUrGIZvmDLlQv-Eqd-TzTNByqHna8aIq_M35WSzJAT0neb9q8ZNz053n33N1pU34zcWUPViiKBXI3nTErz6Fv-Mq-mMXmPZH4KZvLzwJzWHcOxtcJ386XIixnsZtYlJS10AbVePKC_Apk7rR_iv2wioeMgrg0lZQJg2MH5ukhW7__SWG06tv2d9YwyUe89vgMh2KhSL23owu-1i2FLBVLIaMm8gtjpVGBYkB4KIKrjbCv1QR3w&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://onthecorner.shop/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'charlie（チャーリー）',
  '506 Koiyamachō, Nakagyo Ward, Kyoto, 604-8163, Japan',
  'Kyoto',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7578612, 35.0072793), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'charlie — Fashion boutique / clothing store located in Koenji',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2di4p5taGcmd7Ja10i8QpocRAm6LzRHG6HDDog7saab1LKBPNkOIF3SQA8dkoKTLoiOyK7sumTo3GQdw2tVCS7WB5p3M0mQC_PemyFTUtdHqXhiDKBP8TmAQCrty3YRUvJjstKMCcqlhzPAbQ_0D0qKxE5GF2IKtPJ1pLGFJ31-drVVEH60SDXao2ZP743uG8o5PBH4D3A7nS74PKZUumuMhqZxkEyqedGH2WFCc2AwacQ3DeZ8J85OGMIQjK1nNbfX5NLys8SIJymIHUIlwq9KYa5apm9-SqQUMs2twhwmb3pkrr6dpKejCrsXCJJl0sir45YxwkZJ552OxVfVDneBwE36IUt8c7TBCmBlfrxgN2GFEEsGWM3Rvw3IUdCTb2Lijz90gjPBR7XkxEVTG4H99PmgQfVCsFzsyCiHj6npp3pEyjiWyf2A3AlDct5M&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/charlie__kyoto',
  '@charlie__koenji',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Grange',
  'Japan, 〒542-0076 Osaka, Chuo Ward, Namba, 5-chōme−1, なんなんタウン１３号',
  'Chuo Ward',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5022505, 34.6644547), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'grange — Fashion boutique / clothing store located in Koenji',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cM-JVmnMR5RhHYWPOxnkSTYFVaK5vEXZdjFRrSKxTMxfNF62VUdKBixzGQEVAo8em8SuYBAIWwuVXqb8xiNcoxthvrzZRjxgdAq2NwYJ05uqXYusuGo0TL92iscDtckpMMH4x0dfENxKNg_IZD2oDIFgw54PbxJycCZ1zaEumzHNmPCwoHgjUaDuTeHgPpGwYUG6T2Xu8lnoQfswbCIRCr_6-H7wIFxJmhB6DTNv-oW1fx0fFwDCJppqR64P-KTDhVhc2lfAOZyj3LgoK4JrPWc_AiCvBrxjVBuyPP8wN0kuejlbO3L5i82SYnF112FfHh0lK9aTXoEXNa2I66pSDcZ3rCzT_S32ft8KtfDhZYxz-POF02NVXalmR41uLtTHredeWe-2KOIIKDy1xTynWraT2FLgEf_fULn5PQffwZGaeC&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://granze-hair.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'HeralDo',
  'P.º de la Independencia, 29, Casco Antiguo, 50001 Zaragoza, Spain',
  'Casco Antiguo',
  'Sangenjaya',
  'Japan',
  ST_SetSRID(ST_MakePoint(-0.8830891, 41.6498738), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Heraldo',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ck2MdYbbiT3HEs9NQpGffzUPimCWMDksRxwPBGVuo2Y36QLu7HyEK-Ov2xUQD6UBtDQXKwc0affTN6pKvD0GBaZZNawByU4yoONhzqZlI2Ou6lMt1cXCxHWPxz7T3UxYgf5Xvsl6WikNLFUZ5qoyPLNQl3akB8A-r4H4MPpGSWSNdz6e_V_twR0J70jSRb0TrcPdXL3yv9w02HHPmZ7z0hVQtMi2EbgGPI9RXE7nTZlEp0UdQgLxlpnuckcBuVbXntFMrl7YaC3nZMNaG1xekNK38dSXpdKRZdt8vAjpa13MLgZaQpU3eLnd80KK_34BKyAhA282UXZvGzp_g_vVb5MItlNnT3mpGw85vnpPe2bY3opBvbEi5nZHCbNd46NMZLTXCQ1ANGhA-5XtZuFUmaAVxPRNVXzghVrr_PQrHUPA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.heraldo.es/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'NOIR',
  '2-2 Kinmeidaikita, Yawata, Kyoto 614-8294, Japan',
  'Kyoto 614-8294',
  'Sangenjaya',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7172559, 34.8400986), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  NULL,
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2feiQgOSNM-nnMelZnAK59bD2NpFeaUtAHRP3csPRcaP94mJ5Anwld7Fu6JKbiQH0cjj-8C60Yb2M7SqzVRQh-GBhsai390hfHtv-ual5yU89Y6K-HlW8qhYtC-PyDf7OtIBsvGtRyRSbO6CWXWbXofaJD92NiialbxAAkqZKJdo2Jui5anyW3FhJl26XZoeiu6Gse1Gze_mct98V7uRfH5yYip_OUG8xLe4jgoXMOBREJHrG9ExEhLQ_nIsBX_DVN5N674_ZWL1ZrOYafAU0O_tRm-N8HOMvn-NYnSwP6bas-nbyg7st7iDxu4dcWNYmo4zk3qXxrbzYiT8I9n5GX3rjPfayYl64ayCHqYJiHiaMDiTrWKj0_C7aVcK9nk1Kl04hUDAaNoDCs1uvNlURDu09UaUB_Tnao2V5vHHorhf1s&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://chat-noir.net/top.php',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'BLANK BLACK MARKET',
  'Japan, 〒156-0053 Tokyo, Setagaya City, Sakura, 1-chōme−1−４ パークハイツ １０１',
  'Setagaya City',
  'Setagaya City',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6468631, 35.64504), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'BLANK BLACK MARKET — Fashion boutique / clothing store located in Setagaya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2evqeh_7gjIT8myCSQvkKHL5-io9GZLlZs1fze2bZ4wIcVUygFz8uCQOvpJe1aUgkhaQ4DPDUgDpAzJFNe_ZQs_QLbHkvDOO2l8hvhi1flC-eMZsnv0NytuXvHOwjGxwCsAPOd0SqgHXkp3YasQj4Z-GY4Lv4NJ2VtERwQYX48RYnMaABNPaeT-O1fXpecpia3l2mhnwOmFva5rcyUxwIaKmgc9wMNS_zBW--vPF6BJ9uaoTx8Xgk2mWRJJI8Bp8LfPguhRLtQ3sYUoX_FrpNey00Z-JFcCKK2EaVs5Zeo8ITkLwh7nW47orUkoN1_N_qVOv8HGrFxxu8RJYFbg7PUjjc-qYkdz7Vv9YtHcFAiF7eYdaRof6P0mPe9jvq8Xck67BCgfg2Zyok8GrUYK1Fr28fznB_Fg1Gii9Oa9pIoBfw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://bblackmarket.official.ec/',
  '@blank_blackmarket',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'DE CHIRICO',
  'Japan, 〒150-0002 Tokyo, Shibuya, 2-chōme−3−３ 青山O(オー)ビル B1F',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7088498, 35.6597264), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'DE CHIRICO — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e8zuX9s8VL8LQyYLQARSCCN3kGZRVljNALLL7htTfAJBvLrH4JSEERGTJvRbeaG0kIIFc9iZYhalPHBEoUx5HNccVBrBAUIAmIQIM-TCgkuPJtx5cRubjJNxCEKPm1b6kYI9Xlcb_kKT-UTQ4mANEzP1AEpmJCwQ97G_iKpYf-nupj_CoFV4GH8FhlWjMUMR_tH2LtBXW2BdyDZfudUBwr-6PPtS3_Gfn95utwky76zcRZZjQB--LrqkbtmXR5O1V-u73NH1k0qRGBhczYW1-gMm_EhU25s98xHkwQqgqWvZVyYf9LzxGFTJwKmz5N-lwYG84dV8PflnQU0G3kF6mBQZu-VdGxxy7sxqd2DIS1Aot2TMR-4srYxPLZ3-OLR62teDftz3coMGwgg3fa4VOscuJYJvRbwO3h-VeKW6IZYQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://chirico.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'aaar',
  'Japan, 〒150-0002 Tokyo, Shibuya, 2-chōme−14−１３ 岡崎ビル 905',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7056272, 35.6593625), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'aaar — Fashion boutique / clothing store located in Shibuya. Info: @aaar_clothing.st, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dxnKqUA94sW9m4C4RqWNrwrobHwb049D5YZnFmY9o6bMybyYukPccHsmywy5kVihCI5-qgS2e0qUgvy6U_akL7e25tG_1Th9xCeQMHHT5WpY--ItLZeF-Z7k8xp05sIC7DnE-SWHjk3LASXGju9XJrveDIKQU4LQDtYF29iQlvKfZulwIuPwQ24UPjLEgB6OIMSFMS4SuBUpZJRJKTyjEKRt0WeHZmXQHt4HV4YWZ_zspmlNCTloZrX4s5IPYKb0R7nGvlALh3M8vq8LB038qqw6tBSqZqDC3i-i5cIVo9Hg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://instagram.com/aaar_clothing.st',
  '@aaar_clothing.st',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ele vintage&used clothing',
  'Japan, 〒530-0015 Osaka, Kita Ward, Nakazakinishi, 4-chōme−3−４０ Dビルディング 203',
  'Kita Ward',
  'Nakazakicho',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.50327, 34.7092171), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ele vintage&used clothing — Vintage and used clothing shop located in Kita. Info: @ele_vintage.nakazaki, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e9HXbeku_EoNjt4TURTqV31GOweC53bIzaJsczr360O6cYvKjLFkqimefQEM9ak-0_gRNsCuE3E4Du7uANRZb5jYvPvxIFeG3Yimc9UcsVZBvviVXFOKY4sZcq026EpEeBJ3QoYqiq_HZvgEFN0uqpCDZNxPQOUhOBVS8CLju1d1fR2rT3z5ZlJgCZtzoNCC1EdNpH11QTMlQtSOe4y3z-Le7cIKfzeeMdvJWRe2IZz0dXR85WCFHA3y7u7L5lpGT5LLouQnJ_Pn3sefLl4uWaInN3H_RIoTnvPB2vnTw2CQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/ele_vintage.nakazaki',
  '@ele_vintage.nakazaki',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'CETTEN サクラビル店 /中崎町古着屋/Nakazaki-cho used clothing shop',
  'Japan, 〒530-0015 Osaka, Kita Ward, Nakazakinishi, 1-chōme−6−３６ サクラビル 115',
  'Kita Ward',
  'Nakazakicho',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5051789, 34.7075951), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'CETTEN Sakura building — Fashion boutique / clothing store located in Kita. Info: @cetten_official, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cx8-FeHAWO3xxoD36SArpWGrqEK7uWMc40oFDdNQz-Ar4O1JZR9j705dicomzFpnAEdLqu5we1Rd2mm8KUFoY4UcVsGQ-w7B76fBwCBmkI3JTD3nXNFkGmoXguuyPuhPHP569y7RXQfOftkxDtdD_VGZ6VXzGJNRZ5izzPrjlydEGDw4ZiKA_SQOw1-LKrAycGYn2stEoDymXQqt_2lJ6ZGF0IvBvef8-rq_yKf58hJch4CNaWlaKvd3OVSr2IZJ1q7WOtyzJSJ_pl_8YFMTMVGvGG9rAmR2ofpMh34iG8kQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/cetten_official/',
  '@cetten_official',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'CETTEN 本店 / Archive select',
  '1-chōme-7-12 Nakazakinishi, Kita Ward, Osaka, 530-0015, Japan',
  'Osaka',
  'Nakazakicho',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5043227, 34.7078178), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'CETTEN 本店 / Archive select — Curated select shop located in Kita.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dEbRft-jbT30B8CV9jukn-eIchW7VQnnoLpUA6jgfBI5UCdPKwz7cCKBMhra0DNNQrwEpWRTWYZNbESQlAyhyrlldDc5H3HOtCbfCtp-F_zmHDaADEn8Dmx_tSL2Li-btlE3NRZL-YGbLnSVt_0zdAPhYuzgSeKxq0XyPZ_wBzErhefxFQG13GpvPvSTNc_o0d6SV6xSeFR5NIu6-u9wgt-CsMfs4MdPyqCZ6hZhGLVE7yFOeYP-WIpGJpk01GFEBxkbiAN1hfLqZB_gi8VxSOI1tWR2QgKyfE3Z04c7O4uTDvWIQA1tkHcqycYqvG4RhhCRkSouotePCA4OZvjLF3yvbRRPqPGssyTN85BZoe-RKBnLjto8zdaeWBe_Ak2OkV-h9fF9C2v4AavWa28mqsRW6whV5mPOj2dBLH6Mq3AA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://shop.cetten-online.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'SUKKIRAI',
  'Japan, 〒542-0086 Osaka, Chuo Ward, Nishishinsaibashi, 2-chōme−11−１４ ４F',
  'Chuo Ward',
  'Shinsaibashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4978419, 34.6712602), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'スキキライ — Fashion boutique / clothing store located in Chuo. Info: @sukikirai_osaka, website.',
  ARRAY[]::TEXT[],
  'https://www.instagram.com/sukikirai_osaka/',
  '@sukikirai_osaka',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'RAIN 古着',
  'Japan, 〒542-0083 Osaka, Chuo Ward, Higashishinsaibashi, 1-chōme−12−３ 協栄ビル 1階',
  'Chuo Ward',
  'Shinsaibashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5042682, 34.6744648), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'RAIN 古着 — Vintage and used clothing shop located in Chuo. Info: @rainusedclothing, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fBtm6Uq0pcdm0hVlEUreHHpydNjIuWxevbKA0zvfU26Szf_jLisiQyKqEpHSKwe0H-wRtDlyYT1voHq0dHkshOBZjDlDI0_occkfZaoz0KS5ujlMHdKGGD2K9paCS7aU59Ywl9B9sAJ8vta8X2AGKfwnQTo8ChPO3jzTITVut0O_Cq2llEYvaAdrr48w6xP8m60B87RZ2HrH2uvSCLMzV1DtUG-pbSHq8H7HgtFkKTqoG4K4fY9LUaWDJ-npUPpA6wY7ToAuHO0QHrtxFV9LvwqyCvZ2dMyWIWUVzETBlMT-MsUHxyhXFiPQysT24N1dEBpsN-T2jXC8u3giGLkY7spyFLwDmRBm9-M2P4Bo2v5U6OdGymnTHqekhz6glwkU0GwL_4TMvTJR8b13v6J1eevzG9dMVX4xbS-JqZW4DHmg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/rainusedclothing?utm_medium=copy_link',
  '@rainusedclothing',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'PAT MARKET',
  '3-chōme-27-8 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7090193, 35.6714022), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'PAT MARKET — Fashion boutique / clothing store located in Shibuya. Info: @pat_market_tokyo, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eQVb30mpFCqTn7Rt8dF1FavYM_lMtcRxIz5NDivmlkekMDvZksdrzjCzexeFUpvf_SuUlW6rVGDpoDB6pLj4En51NalT8xS56iZsGBYZkeP5l86sbXUwqtv4CEHhc3t2u2Va5rZEoENlPG1Sj08ugoRBk_SPBnoiRQt8hHAZih1OO2P-AgfkHkaFEUof1A-QvWpu0RqjYze7sE-k9CfijHQcJm7lbsCYzOqrRwflpGLENo2Pu-NvKGclfpI-sNOmGiNF0zyVz8k-1mWXQGg2gOCsc_5-TF3dCekGb7sclTyGtjZv5dpcDM0QY_37yWR0vMkv3BD2hOfofYnW5YzsNLdNUctaglLdMWjYgioTlWYb2EfRIH0gDbO-m5F0MX4V9Q-me9Ikp7yNWiCdAy9r0SfgeRV-49FIRzY19ZNoGWt3qM&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/pat_market_tokyo?igsh=Y25rdHNiOWtnZDB6',
  '@pat_market_tokyo',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'AKO',
  '4-chōme-9-5 Minamisenba, Chuo Ward, Osaka, 542-0081, Japan',
  'Osaka',
  'Shinsaibashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.498677, 34.6777894), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'AKO — Fashion boutique / clothing store located in Chuo.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Coil',
  'Japan, 〒920-0909 Ishikawa, Kanazawa, Fukuromachi, 1−１ かなざわはこまち ２F',
  'Kanazawa',
  'Japan',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.656722, 36.5722622), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Kanazawa Temakizushi Coil — Fashion boutique / clothing store located in Japan.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dcyvEifQyUro1av7k3PEhBb6Z8ycYA1PMHfepNB6yUn51b9vDezm4H7eTWOvdK6_ILDnl4HvcGLhs1LDdWPdtyeQB9j2mUykxth2c841SwzBVrcxx6DadcVBr1SSxHIks4q4mfKgmPFPCALc923SmKlzJNsmt9z6rp4aGmxs1MPbt1geqHXqKHp80k0s5esXfxB0JlmFW8NxwAvDMJL1KvOesNvLrbagVz-NpRksPvqDAaHAsxs1_3lA-qz2wfmS_bIrqhVjxgI4-h9n7Eg48iHHZ-aTrzgmvOsn6S5nCFeg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://coil-japan.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Lusty【名古屋 古着屋】',
  'Japan, 〒460-0008 Aichi, Nagoya, Naka Ward, Sakae, 3-chōme−31−２１ Nakakoma Bldg., 新館５F 伊藤屋',
  'Nagoya',
  'Nagoya',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.9081144, 35.1632107), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'LUSTY NAGOYA — Vintage and used clothing shop located in Nagoya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dtId28MxVGdQsje30FCmLL6h88sRmPsESbxyaUjxSz_X17LX42_UzDB7M9yx8tsJC6_Sdb7_Pz1hlrBDQPhZ1XYcoY8JH5yUG7m6jJLfQJQzRdRlUsz5INXHkHiyMOSltS3LaEZ2WWX7RltEVv-01PC8iwIqkneY_xKJBNQvYNaQdJqNLvvtkH9QqWcENY9KLvWVq6ew32C03fHr0IMSiVMlKPldxnoOR_ceEcA1CAUduPt7L9Rr0G-aN-RNrdHSf6jqZGcV0xuimPXk__btEpN_3kidIDpEcLrcf5FhiRDA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://shop.lusty-vintage.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'PAT MARKET IKEBUKURO',
  'Japan, 〒171-0014 Tokyo, Toshima City, Ikebukuro, 2-chōme−32−３ 拾ビル 102',
  'Toshima City',
  'Ikebukuro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7063567, 35.7337593), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'PAT MARKET IKEBUKURO — Fashion boutique / clothing store located in Toshima. Info: @pat_market_ikebukuro, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fQY1e6zBlApyRx3yQ62-CEGkU2YGjeQwi7ObkQu5jjb7MosUYmV7XwYYrevQqLPiWuzGpyERYWq9w05hSNtjMtXwxbXyyZtorP6oXkDLGPMaiaST955avgWihGGYv-Cadv3IHZr_mJKmufzegJC8htvaZMLJ6o6jNsWJ9kn1qM37vcNFOLH6d2SXQgJ_mLFuuFCwpEQZUxjj2MXjhRM33Ygo3LybI6mQGTVWqLgFWRSCnV1SUF-tFvRG0mKlvLxRzoVR6lOUJ-5VL2x_R6D4LB022UCSLsWzXNQdiBViNUjg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/pat_market_ikebukuro?igsh=Mm9yeXczY2l2Z2V5&utm_source=qr',
  '@pat_market_ikebukuro',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Only One',
  'Japan, 〒171-0014 Tokyo, Toshima City, Ikebukuro, 3-chōme−63−１ あわ屋コーポ １０2号室',
  'Toshima City',
  'Ikebukuro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7073948, 35.7367858), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Only One — Fashion boutique / clothing store located in Toshima. Info: @onlyone_studio_jp, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dAJVqEDSCMZK-2k_Dvnz1syVkiRbsYtHUkLS-nQ1DL4UgLtS2F00KPlI1SckYmrr80z-Twt-kONCwhYdiuPGRNet56qV_Mq4UHKli7Rmx2ttftMfx0tAPP219Ll76_ajDWunt89mndHVUABqJlJBE906Z8tAtfRlJ1qQ2KN9yjD4vux-zYv7o0kJJdAqmvi-gPSjc_2yxQVVbMfp8lzsqQ1OkEBmRXfwiy-T8S-C_VCpD-P15bFCmC1CPQ2gjiUbrJ6kJNmiOHX3MbNY5zkZv0XH7GIxNSFOhzxCa2rEdyxVdXBuzh1EDwJap27dfb4azHdundI7TGx7id-uwd0IM5hWX0nT6ntOxHx7zO0sNroMyJeK2VcQXZXnaVaZgJiCp9mJHzBWH8Tr-JuTvzVzHdSsNTlAFku0QW343rkqhOVQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/onlyone_studio_jp?igsh=MWtxNHFyZ2NhdGVnbQ%3D%3D&utm_source=qr',
  '@onlyone_studio_jp',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Waves',
  'Japan, 〒510-0881 Mie, Yokkaichi, Rokuromi, ９５７−２ 957番地2',
  'Yokkaichi',
  'Japan',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.618747, 34.943159), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'WAVE — Fashion boutique / clothing store located in Hiroshima',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cZ66lw7eayh5-2DwMNsALduDAfDdI4yo_g-YFFAplL4BY6LnUx2mbvhWoWy39LJ_pHPt8amRx3SkbfLB3lK1kK6-fK2pGFBABk8lhyMKXbmpKg-KyUNZPVz0dHF6ytWx8QnuMr9hg03kWYudMtmOTMSKcUU9EdqDuymRBTumnAV9D7oJYTyRbPaglC7hrjMOki8gRlsbLjyMmCk_f7bVrRNe8JABVDo66myTewN3-4tjehe8lIPseAWA2pIPUYXztnZdJBXnhbvarS4mckj-6Ia-VfiQuJ3B5UAB91sRvSaA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.wave1988.co.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '古着屋 FINCH vintage&archive store',
  'Japan, 〒155-0031 Tokyo, Setagaya City, Kitazawa, 2-chōme−37−１７ ピエノ下北沢 2F',
  'Setagaya City',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6674313, 35.664175), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '古着屋 FINCH vintage&archive store — Vintage and used clothing shop located in Setagaya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eoOgyUp1mwx1J59wKnrJ-wy9T0dkoCgoYq9Up65ZoTBGUrLw4UllAtjWZXOdD2S2hZwRb4hJxe8f6iqoAbV1omV7r1obZEoDrM59vdqvtd_joSKN5s9cBy98KDtt-yhzsYB0nqKSxWZIvTmTbUiMhrwEBUPiou1QY8QZd7m_th-h0LXhih0uUFjzhAtN4tCuPgrL_0EUElxrGGH9ONUY14gU_aBFfsEK0MWeBt2sb-nZF615r0yUJmkopSomGPN91OsRi5aRhsiN0mpnkkHJ5Gi8P25XsfY3VCBA5x2R4ltA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://finchstore.base.shop/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'SAMUEL FINCH',
  '2-chōme-1-3-205 Sakaemachidōri, Chuo Ward, Kobe, Hyogo 650-0023, Japan',
  'Kobe',
  'Kobe',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.1879597, 34.686808), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'SAMUEL FINCH — Fashion boutique / clothing store located in Chuo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ck0y9Wga0PhZWtymipRYQ0j6hgVkR9u4JE6YrSeIPZpZZbWJavtkxLInTszpCbcFjuUpW7Rlgc6bvB_8dbvP7ONIjgQcNtK9ZjmnwlBjBlw3-0M2UNdn3glHWIpSlleSSkTPBFToy_1LI444Acn6LZOvqlANYUbE8sMliVRUoYdN9wjaQDwEJpxdP5B1BGkl5-LZW5KD5S_alvGKRFqk9lGE_HQjI6ggXa2d3370tq-CEguE9eknZztQiQ77ntLIEvx63kmgOm-KSTu-T0ml0kx84PMMCNX0rSbLRkIWZ6xQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Modescape Shibuya',
  'Japan, 〒150-0041 Tokyo, Shibuya, Jinnan, 1-chōme−14−８ 南部ビル 1F',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6999231, 35.6638461), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Modescape Shibuya — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cTfnE3u4HF6y04qDaHrp_Se7EjHtlNIhYqi838kIx_LfaMU3DtDIvmRvmSdds2g96h4wuNWQLRrFLxUpBXJ-UtNwBgAEBf4zp24OZ9dkZpvR2nq0XJvsAsqgToZOXs9G0bgk0X0qPyjC2klJCS28Wf94-7FV7-4YnfBaPMxMzxSchsq5oXvqqTrsaqS4ZtZoJr-XzZX5YwYyI6e-llAePmh0Qy_DAvVHkcOmgAzx51N-8ZbojNVYjqQ07kJIq6ZATCrPz6j1t4x-eAt9SRCD5c--1OlHMMSDGIqgiT_W1AzA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.modescape.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '10tow(トウ)',
  'Japan, 〒150-0042 Tokyo, Shibuya, Udagawachō, 11−６ 渋谷宇田川ＫＫビル 4F',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6974593, 35.6623354), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '10tow(トウ) — Fashion boutique / clothing store located in Shibuya. Info: @10tow_, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dpOHiMhT_JBhwxP3pyLnUXalLHYwj98LuXOWTcvMvcHmvLrZ5pi0ZI42KAcdQgoGE090DcF0PSlU_tKbTDazfJt8pg0LCGPxL7mnBVnPPrLOMP2BQooA2Uu1619o2oJMYMKW3YvC86-6aMZBqtxEKaHUmvQkKRbsO51jr5kGsFhFY0jjxcfQALntKnVfxqvgKBPafipkhm0bJOE6MGkPGxkdQ85SOoUwVu8Id2tYNEXoIvTO9GLxOEVSmy5CVPgE21TrmUulO3HdFAUiL9_9RbJUFK7TFocj1aVvVUVDtndQMmTnXl_UBFTX-6rtKAZLefmeXItR_lE7X5MBA9oRXemtV11hhnAbTgM8_MQUT4L5FkfKEMUxhnD0cLakD5xV-YI5VprZPJUm_kE_foJ8MdmkLpKrsk4uOXgC_h06Bi0JvG&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/10tow_',
  '@10tow_',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'BINGO Shibuya MODI Store',
  'Japan, 〒150-0041 Tokyo, Shibuya, Jinnan, 1-chōme−21−３ 渋谷モディ 3F',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7004778, 35.6615867), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'BINGO Shibuya MODI Store — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2evnDYnrxgARegghh4RFL9r72gxCdGR1lN3NE6kgQviNiLgjUkHXEh2tO47xJfQCaaUcYBLfY8fgSajiUJFBqpA1RZ5DiBCQiUvbwSNx7YIDgQairDN3-w0IjhpCS1f6T_iLiXDH6Hr67ropAJatNYnto_I6sBDh1nIXPcOz7HFLQKT-tnW6zge2y7FcM6cnZOMrW2-BE143tjTEZwsI81hEZgU7P5RN2sHg4MH2LJUY7X4eH3wldydajX-X8YYhgviNjPTQLCSQqImA2A3187eyDQS-Cqp0o2DVQpyeH1N4jrDvq1FpFty2xjCo2mBpG3fafRNCXYqrHPXJ5Trf8tSWX-nv9V5rTCNWD2Ij59vNjTSpIFEicBCoR8bMryX_2TCVV48zr6SAHeac6LydEary04M2i3ScUJn5gQz-PWKB2Bs&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.bookoff.co.jp/shop/shop87011.html',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'LAILA VINTAGE',
  '5-chōme-46-2 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7084973, 35.6642299), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'LAILA VINTAGE — Vintage and used clothing shop located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2d9XWS0wEac6bY-GQQ4UwKVBVWr3_tWD80Ptrk2qAIQVr_79L0zQDYfni0NaY5wVqojz84Je196lB9I1Ub5L-6YbJQdhBjvJpdIqJYSRBgpBh3hzOWjJUlR-ZU987uOinkldgP8LkEbZ830WdGsxOYmQoYqj4Q1u6FjxJLCTeT7k9BGNN8hrOtmH07RL9l1ZdrYM-3txvqm5TRVRqnA_NFKNN2XV5tSPJsPus-Xr2UDonGuomyCW3NorT6YpbNJ9O4MZJ7mOIogS_etdPFDm3uqFXogw61ygHNa0AsDx8vHI88Dp0fwkg7DwaMnL2ga_V6Lq5WmASMVKtF1dH7y6ZqwOx3FY-KoqV6wKsFGFBKn6mg9J32sO_VyLUde1rI44b20RIenlGdHQhvjBXAJI_wVcxy9V3IZ3FSOwPXD_PhlXQI&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://laila.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'blue room',
  'Japan, 〒105-0001 Tokyo, Minato City, Toranomon, 4-chōme−1−１ 神谷町トラストタワー 31階 東京エディション',
  'Minato City',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7451346, 35.6653627), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'The Blue Room — Fashion boutique / clothing store located in Minato.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eyOvzYWQcGAsWu871exqso0eT6iAS5HUIR1N0sERA6G6VaDuzm0DuEg91GE-p9G5DFNt4u347nLpID3Jhp1G3soPWSVcJ_tr1OgvG66av8tJw_mZ5kAxhJXgTK9y-nR-EjYdG6BMbwl81gRHlSNssy6mCRjC8k278KsnB9cYgjh_xEocxnWwzyTTZGtEyQHDuixJWK7_X_oJpr4BjHsD2FKMbxQ2KipCfgREV2wC5OR9TR-ZItg6SVYs3BjJdp_Ce1mcm37Sgo6T-D_Ab9CBhdhAwoMI3gsSa5TCEAMFSPqQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://theblueroom.toranomonedition.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ÉLÉMENTS',
  '3 Rue Victor Letalle, 75020 Paris, France',
  'France',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(2.3853019, 48.8672831), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Boulangerie Elements pain bio — Fashion boutique / clothing store located in 3 Rue Victor Letalle.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2faacgdxVU3nEQdhd3kGn5GDe_pzVUb4V9joGLzmD6Ii9gXmVxRHsNe6PzQfMzOGShxMzTRsdn6TUzIYr98IIrZ0Ovdqv14xTXNszqkp1dRwqSlF0g2_pjFVnGmQVmBQ8AiVSE4HOeV0u-0RaTtyW1TQog2E1Q5VHzGJlAKiYU9lDk6DfCZikMMMi6KAqLcUAfNlVYL2Zp4yeE-IPs4oK4VngPPY0uJlX9eFk-H_NVKBTzFgddrA_7jSVs5d_2L8QURIXCkzSpGtlfmsGAViYB3BK4q7OWILTH7RrP8qB0MSw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://elementspainbio.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'kissmet',
  '3-chōme-56-1-101 Kōenjiminami, Suginami City, Tokyo 166-0003, Japan',
  'Tokyo 166-0003',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6481126, 35.7038447), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'kissmet — Fashion boutique / clothing store located in Suginami.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fhB7d7Nl6ISFnW1938nl75I_UnPboncSWtfQPuqQMqlRkqqclrkZutLOsYoRp1nxtjYawA_9ZQ5qANN7wuoV0EIMRBXGEa2Y-0CzlO0Q1rKKiU7lgd4pK3CGujzaBzfMyCfoz_VEsyOrM5p35_MHdsdFuMY5rIjLtpUWIjmzkE5O8rpd382nxGVLG-JjBareJJA44hxXM_kFqAiXlaMQOiNySSCBZOQjV7scw5uYQSfNBAGGNPrOzH5K-JRD5GIl4m4gXGJvY5OROAJvtiOxUkynlqpJCEs7w1G8ei2Mx1oLotn5ceeVhdXeT5Nish0kPNuT4WgXQDjMYgynhjVCK-fdE6hSxMjhi3eb0mVTKB-whknJ-bur24xyoLkBYTwOE7IYSju64LWGuoV9-JlgLlgCgDENq6m_pbMm2vXYU&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://ameblo.jp/kissmet/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'CVBIN',
  'Japan, 〒166-0003 Tokyo, Suginami City, Kōenjiminami, 2-chōme−21−１２ シュエット M103号室',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6477297, 35.7010421), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'CVBIN — Fashion boutique / clothing store located in Suginami.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fgvx21hl_DbNihKsXbm3TBCcG8oVvtYW0Ii1mtCN91RB6VV7HelzmITxidFpOdOBdUWA08Xw38J6H0FuMkiAc9RWTL9j6AQt-yrBI5wMzQRizCw8c5d1gwZjWU-mwfO5udXLAQfWJ70cHetLaD-VfrrZtYNilDksWKwqI5PLnQcexrdZFPcyjJRELFcXmc71eGrlAB0FfeS7UganJavNLFW9di0rZpSX_oicGwNauvQNwBagtIgZX-Lkz3DyGAKrqEhoWLN34ns0lWotVOMCb33nBzULNhj1Q6LFI2q91gnw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Boutique Ushiromae',
  'Japan, 〒166-0002 Tokyo, Suginami City, Kōenjikita, 2-chōme−1−２２ サンハイム高円寺 4階',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6542266, 35.7059559), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Boutique Ushiromae — Fashion boutique / clothing store located in Suginami.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '''bout',
  '2-chōme-3-2 Asakusabashi, Taito City, Tokyo 111-0053, Japan',
  'Tokyo 111-0053',
  'Asakuasbashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7862557, 35.698647), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '''bout — Fashion boutique / clothing store located in Taito. Info: @a.bout___, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c8K7To4ICrjFEu031958xQp2Pk97aa0KYxy5AQPwdF4QmUEgBBFyp28ezNr8dQIfyegiZIugbH3twNzerhR-Mtp22vVgS6DsIAz9qKscCRPMokRhhdwC8qO8SN2kQStLcutpKucNqyZNDTM6ZplxMwVUxcC_a4XHVrj81GAd1LkLXvfwWmXItgWo1MD3lLkcswikuoPb_dia0vyBMptPERptPmaQbFk2KrBjUn2rS0d1SXIQaFHt4ykkx-F54FReal_kSMVHkBJZmCPUvV4NwzAeYC-r_6cygae5WW1bg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/a.bout___?igsh=OTI4eDgxMWJ1NXdz&utm_source=qr',
  '@a.bout___',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'floccinaucinihilipilification',
  'Japan, 〒155-0033 Tokyo, Setagaya City, Daita, 5-chōme−35−８ 下北沢シャモット２ 105号室',
  'Setagaya City',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6641758, 35.6607523), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'floccinaucinihilipilification — Fashion boutique / clothing store located in Setagaya. Info: @floccinaucinihiliqilification, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dwUbov4nVpy7WvTEl2FQICzE5bExiEUftaaaFCzZ3LMP6h840jeSUi_B3wJgw3TLkt-UIv-e6UBBg59wQELKtZ5UN2IpG_CgABoXreIE9Y_LxM1CKzBtIF2dBN566AEKmFfllBiDjsf8cyTCE5r7C9Q3XcDS_UUp7TsqKHmZjZ7YZVgWpWEXgQc8BB8hvrDP2WKlX2SqhqQj372Duwch18nqeURaZq4BGKt3Pnx032v0xnZlqGv9t-zswGB8lYUHpjFUEdZVZjVaSILKucMmEvFFYhQfM_jonK5oLFZNHizu0FQxmDx4sEe_oHFlWWezc9jSbBR_nFu52JXI7z0LBCJCNHmkQjmGUcgntTmnavjsc-NaurYsvd-c39vEQg-KWPIdWRuUD16HT6OM0U8e6NW756B9ls5cOmunnQCU2sGcs&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/floccinaucinihiliqilification',
  '@floccinaucinihiliqilification',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '古着屋K2 〜Coffee × Secondhand〜 | 台東区浅草',
  'Japan, 〒111-0032 Tokyo, Taito City, Asakusa, 3-chōme−26−８ EIJYU101',
  'Taito City',
  'Asakusa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7983179, 35.7167919), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '古着屋K2 〜Coffee × Secondhand〜 | 台東区浅草 — Vintage and used clothing shop located in Taito. Info: @k2_vintageused, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e6n5QAo7VNqPow7IUf21qhplmUK5_-FdaOWNxC2L7dN2NkhW3jYVjn6G9N0RTo2diANckSjWz4-iOgHs4QjyrRBkox_0ayguBsSo-KCB9qYk4VkXNnF9wTg9QdE6NLtOyp_w-uoxWQHJGOEVyoQ3wP3Ojz9NEgY0L8wAGIG2k_9D0BwcUGOkTvj_mbcJX2bS3VifEXhps52WAD-5JJ8WPYfrdwaVPGy9hVF4yeiq_Sd-D5JuQmmj3uyXHLaW3Otbqs2qowpyLBZ1ugBA6Rvqet_gnLVKMRB53WL29E64rhPAAdQsQREh9kVIPo7EFqBz7ymPKi5TpCK9QUz4Jop1gXZs-klBw_rrIHODxfzU4ObJkf3-CcFoz6r4DG_TA5I-Tq6Tl9yeCVjo7tCHR0n__0WejtlRo43XaSx8zmZhA1M9tx&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/k2_vintageused/?hl=ja',
  '@k2_vintageused',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Maison vintage clothing',
  'Japan, 〒110-0015 Tokyo, Taito City, Higashiueno, 4-chōme−13−９ ＲＯＵＴＥ８９ ＢＬＤＧ． 3F',
  'Taito City',
  'Ueno',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7805644, 35.713971), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Maison vintage clothing — Vintage and used clothing shop located in Taito.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eZuTG6es_egPi6a_ncjAnbQjwAcA8nA05rAUv_BbZeY8jkoMujIrJkmHsvW61NHA8M7T9kK7OrCEdll8ueQsDh1iN0PCS_v5yNfhYOePkqp0ciDEDSZQE-HRYIGwTaDJlda_Dd1DbecKf8cD-Q0AFq2SPOT98v-Kp4RUQTPTq_6dQSn6MVZy7YWKW-iovHy-As-m9740pFXQNUrKzvBo2ifP_sDPNJvDlvC2uu2jOW_Cq8VSIbxJbuIyfEqoAxTphg-ZRrfBmp4hS_SVzb-RvI28xUVnYKJHMklxnWf_NbWw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://maisononline.official.ec/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'NEOTENY',
  'Japan, 〒111-0051 Tokyo, Taito City, Kuramae, 2-chōme−3−４ ダイシンビル',
  'Taito City',
  'Kuramae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7901368, 35.7023083), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'NEOTENY — Fashion boutique / clothing store located in Taito. Info: @neoteny2023, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cI8BLxEXI4lBFGZNN6KHfU6wt5YAthBUl34VeLirx9bDyh5pa9olgDTnq2F1ixa1krlo8FeKwcpm9uKlSfbM6e6j0PludanGcA8Yyoi15B5lQ7xtkxxs-K09FHuthTLtDgp26VAnY7HNEPfc4C2SuDggIrpklRQmTs6-giMKJyMcIMJhggrF5X9Uod_af6N-eJ5Kd9sDLi-siRxjv4uRO5Xq2F_SkwzD4nMfNxz4T0rY-LSTi7RHMswcjO4coflji1_SWV2IVT3S82Zw7IDp7NUCypM3YrUDG3kPEo4NOERXERQZV-7vm3MLgCuy-mBNOcAqyVSz-_vlJLBFSACm7W_49ZxVlTLavUrpxT8ZR9fNP4F8GyKC8-skliDOWfmfAmWKb8Qzm6aGVM1AqBXoBGq7ajZJKzse-1Y4YqudOupX9790BuXSTsUUStUun_&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/neoteny2023?igsh=ZHhuZm0yNGZic3Nt',
  '@neoteny2023',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'HINOYA',
  '6-chōme-10-14 Ueno, Taito City, Tokyo 110-0005, Japan',
  'Tokyo 110-0005',
  'Ueno',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7749341, 35.7103297), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'HINOYA — Fashion boutique / clothing store located in Taito.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2flh8rmeKgWULkzVtvgdotvUEMitQN0hCH5_wUVWC7_PzRlgBjuH7E_FFksRKkUTe0qeeian9Hlntttf6j5cMDIixGZQLut38P4YNp8-u0kJyV9hd7m8bHJK3FjYnIxusS9p1pgmqyA8Le6z0ENzxchOXCe1QBIF8i9hQYE03cKCauLGwa7XpR9OsUG3M6E7ulpqMmxMR4VrTHwmShnWVxNTcVJUq1M2ovCbaXGvWuxHaJQ8p7M9-Nw-0iwQ4ZF9Te8SBwZQXJrSbIJnn8znoU9FNhs-yCpw7LvnPTIzmiicLYX_veTU4K-fFoEtzeI6zDWHLFZopT0kyCTl7zbul00H0hCXUGCeIquvtwkcOy-pAPpC4Z1Io5Ozi65UeBJupXPnhEzQlRuV1UriEn57Z588hcHWDmaoEUU51UHn7ta-w&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.hinoya-ameyoko.com/hinoya/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ray Used ＆ Select 古着 セレクトショップ',
  'Japan, 〒530-0028 Osaka, Kita Ward, Banzaichō, ３−４１−２０５',
  'Kita Ward',
  'Nakazakicho',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5045711, 34.7050081), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ray Used ＆ Select 古着 セレクトショップ — Vintage and used clothing shop located in Kita.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cYaNGAo-cgXrUQ2GA6z3tdD9njOM4fbYebIFfM2GmpEvZL4PfD2aYO2ZhLn0MzlsGby2dIQ0zXAdlSyyLOtqjEtyN-8rAVBaaLEvGLqLcKPYkdz-w6yVJp9KAp9vV88_9Yn1cGsTcShtnWqbz3Ppc_Zfln7Mkw2RhdwkhmvWHH3Vus_fIQks7s055D7O9rElhRETPrXYIYaPLHqL8BqsJeV8_Miu6abMiAf-wi1d99R5YmUBqqiI-sfNsTS4pfTjoD-v39EaYspWKjWuHCj71oxNnMjsF20W-VugEXRTHEXQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://meta.main.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Murakami Store（Tonari no Zingaro）',
  'Japan, 〒164-0001 Tokyo, Nakano City, Nakano, 5-chōme−52−１５ 4F',
  'Nakano City',
  'Nakano',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6657324, 35.7096996), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Murakami Store（Tonari no Zingaro） — Fashion boutique / clothing store located in Nakano.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dqK7N9fNHlNC_0U329Wc7OSpw0I9P9o28y9iIGT7FQE2otyY2_PCllxcPuTOzgsCcEz_U9dOGiRHzFba_iW2zYX6SDkBSa3CJdJKOwvOCLwR9xYL8VRnXx-ocWbPgRV_mJ7b2v4xs91glfG2UAMoWnRfpb8rGzgDF5XkxWjj_UxvBwRym1JAC7a__2hc6VpwDvDRMX2QDuek_C7N9s5nJ3wmxQqbTVKe6uMsUVZdnRdWRno4d2m1x2ylssFth8pxNQyntkYtZFiovFlSyigWpTS2et-Sn25UDowtrpTiUMeA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://zingarokk.com/tonarinozingaro/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '2nd Street Musashikoyama',
  'Japan, 〒142-0062 Tokyo, Shinagawa City, Koyama, 3-chōme−24−１ B1F、B2F',
  'Shinagawa City',
  'Shinagawa City',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.704524, 35.619205), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '2nd Street Musashikoyama — Fashion boutique / clothing store located in Shinagawa City.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cQvUUk6EyJK9Uz-Vtd8ZXcFpkeZjCeI0WI-KkI3fzTdiupOLVn7U0x5bFUeBO7DsGo-PYks6ME3D7uHwvvTNuwjYXZdRLNLwWBmyktyzy5GB7byRK5c71s6-hmVwRKRyiKmlfnvAz0vGE6EVyVzV8KfE_RYZ0WEWLMcDjzpdmH-WxEy4VprjI-4B30IFQryPm4qXRc7YDn8c6J4dcKvW7snt9b1Jv-jDKmRiFyVB9RVEt_kFCnNJVS1y3Rp6Tpr6NZZzH1txGugXKsCz-X5Bh9z6ZvkJFU96aVHLAiCT-7wrlhjwHfcPXLdV88b71flBUpyPfXQCy0gEj5WDkPExMHqH-alfJUt2yrQQHYPMq-rklFh_c09hsPoWg9V8OeZWvgspZm975InQtp2apc8yjFRy-EKb9nHbg60NLkmmvyLb2h&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.2ndstreet.jp/shop/details?shopsId=31288',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Grey Archives',
  '10f, 3-chōme-1-36 Ōsu, Naka Ward, Nagoya, Aichi 460-0011, Japan',
  'Naka Ward',
  'Osu',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.9035656, 35.1615686), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '10f, 3-chōme-1-36 Ōsu — Fashion boutique / clothing store located in Nagoya.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '古着屋no pain no gain(ノーペインノーゲイン)',
  'Japan, 〒150-0002 Tokyo, Shibuya, 4-chōme−2−２４ LIVE 青山 B1',
  'Shibuya',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.712529, 35.6604184), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '古着屋no pain no gain(ノーペインノーゲイン) — Vintage and used clothing shop located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2do240N65d0BBHc_6t7YFmc--KBu6tILWOeNDz3THVUM1csFnb_DmHhMwdg6rKGrG7vrHEMtGuRf2v013K4OPRKW6D5OxPLFRFLlo47URkD0lqn0Hgex0Oaxt_F2XONGAtH7oHJ4-tFLWnRmKYiiM9PTItpKlGmWyL35nyKMwfukpOYsiN-lmrE4fiFYluT7Ega6jAmNdMZxv2PYxfjdu5jiVvTnZVYPdl2XUnhhHeivQ-_TvzmtQnNUhSekFFhjwva_anKSAc_Z4aSMJxqxd45tEePNdiadJbgmgYCxSY&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://nopainnogain.buyshop.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'OTSUMO PLAZA',
  'Japan, 〒107-0062 Tokyo, Minato City, Minamiaoyama, 5-chōme−12−２４ シャトー東洋南青山',
  'Minato City',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.712084, 35.6610749), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'OTSUMO PLAZA — Fashion boutique / clothing store located in Minato.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ceOaojdRhb2m8E6reLHP5qtkPMgq18g9SmZZXmZQEOQaVPnW3qbNihquievkEEOknCYgf28MUIqrgUUQzjJ0-ZzzV-p4sMPggurGWB8eOFZuWiQLeuKtoXtSVEAglHvPWbXlz899hHM5OLMrYDmPHCODyriDcLnpdEZl1S4-fkyj7bNYxmFyrY09avwJLVqkPIqdYjfmzn81E7SPo0n5MSxmfpOTSDtbzwPLbFHOZgbn8fmjO_IrWzh2AYJlQHSiz0RSgNyjoUPe061vksVe7_bAkgJoFXvgvk8ttA9GxHXPzgypA5SDk-CpfUigxOXXvwkVBKgVdwjJlsji45VvvZGbelB-2L63gqL5AoH9kWWO8UXltn-cvEnu5C1ixFO-52g_VSYsud0Gl-Ydq__yX9l3cAFbXzlEnJvpg43cY&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://humanmade.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'LEV MARKET',
  'Japan, 〒150-0041 Tokyo, Shibuya, Jinnan, 1-chōme−13−４ Idoビル',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.700451, 35.6631787), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'lev.market — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e3r63obcKYKWB5k053777_P_P95_F9nehN9NADfvK8e_U7TNhv2cFSd4CiBisHZrpfRbRd-uHRnIcbdHztRnSjmYUbJx4COrS6xDe-ecuz9SVaH20Sj3c0dcbF7nzaeENymVQKN1pNRl7GUMmB8Dz_cO7PPF1tDJ5gqVQ1wxQpA0ZNf-StU3Na8ux_jgeNMtlTxrLArHMko5ROU4CNu6pdhHCMU5btRJRM-NazC2I23LLQharq3CByaA6wkswzJh2npdGURgVm2QDIBt862BCZiZgIFdHufi54Dldm5PQo0yQOCF-5fnZqEpaVMK4yuIEqwLiqXiBE2PRWStmjHwCrZf5Tef_yTFOC3YrR1cW4L9Q7sNOEwlQSTPol0_u0YodK7kcb9mhiNg6lHAjClIRxAA0jA8NwZdkfDewUQT0P9fxd92qYbqBCt8MfIQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'AFB',
  '1967-1 Kōya, Ichikawa, Chiba 272-0013, Japan',
  'Chiba 272-0013',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.9405635, 35.6916742), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '株式会社AFB — Fashion boutique / clothing store located in Chiba.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fKlxjf_8H4scfFpgyN45bwdpvSsJBc6f7fYAZJ5o1vMHBeKf9lFQnDEAw3Qz33Tm_uzKS-0c4CYq_r88fxeKNs2apqRd3hJX3S8XWd6n6fq6BIZogyCPuT2IVICSaE2lYERvWMU8Dvbv-24b2pgg2-kvULj4ibvBW6p8oylJ3LkuggHQvogOHlxmfO9-0KCB1KxkJ9lC9KgcoPK2Q6xT0RNFafxB5uQQB9UNitLLjj_5wnuW5O92c9C1wsQlQ8RZvoIGKYFjmCSP23lVG2cotsOkN9ddgLIkLiY-rNu-ByNPEwd4oNubYLGLocaBki1v-wYLXinyn77eYjzXsI2PCAOZZUtZoF-SJXOBAyHVzvnLBFHxcQB7RPHKWSmGMztbGybjfKKM5EMwAq4ZMxl2e7mxL_TDiCgsexLeWIJdFlYm4&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.a-f-b.link/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Achuu Kyoto Vintage clothing store',
  'Japan, 〒604-8066 Kyoto, Nakagyo Ward, Iseyachō, ３３９ 高橋ビル',
  'Nakagyo Ward',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(135.766465, 35.0070222), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Achuu Kyoto Vintage clothing store — Vintage and used clothing shop located in Kyoto.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cc4hAgYfM9HHDQlTB3DmMUGYELwBgpttfoHJ82oekjJRLay8IjMqsy552SoKQAg-cdX8TZ1Z5V_MXk5ypw60sU7Gvgu5veHgPCW_kvg4_A-gDuPBvBvvLaPAJgROfp9kIAnB1CsBcxU6TsGym308J3m_M3cfU-Dln7xircVZhXwUvOKD6Euh9DlMlJK5sxTwrsk6Og1-gE1x_z3ocyJlKX43TYhhnzfTJQQThlKX_LWhGn0SKnLzmvzvzln_HX0RGV_6xJ10BigwwGPolZje2F4kxA7ztx9xWqGrGnxTw8ZA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://achuu0422.base.shop/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'USED MARKET NEXT51三国ヶ丘店',
  '4-chōme-4-4 Kōryō Nakamachi, Sakai Ward, Sakai, Osaka 590-0024, Japan',
  'Sakai',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4944829, 34.5655414), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'USED MARKET NEXT51 MIKUNIGAOKA — Vintage and used clothing shop located in Osaka.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ffhJ0FIQ_zy-ibxX8Vxg1T6MHfo7_-rrOt-TqTUrd82jWEVJFyJgExjWojl_NI6fIqR1aHaWKZToYtSkr1wtq7IkFz1QUjwkQXztC18XvppGFsg-12VOMIQeTT9XE9lNrKwSdI6w4YQ4aet147bZpRP1HPCYQusyfqoVxskNinVe8so_Z3hdPkdh4s3YH9yc8DW62K8KQj54UGKQvnjIdEfkjyXi0Rihlaosii01Cxy7gkiTQSEBQrH8ljPUrnJogQwHJwHQTFDXQy67cOPoQMYPOOZAznagQSuqvZFCT9Ew&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://next-51.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'TreFacStyle Waseda',
  'Japan, 〒162-0045 Tokyo, Shinjuku City, Babashitachō, 62−４ 芝田ビル 1階',
  'Shinjuku City',
  'Shinjuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7192447, 35.7065003), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'TreFacStyle Waseda — Fashion boutique / clothing store located in Shinjuku.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dUcbHSg5_v2K-azjyM8FU5EKeK5UwFMycd2wo3klvK8PUfngrL65Z9h0Q2Zq2LDpYR6OhwogtrbLM5JYSbmqtgCoGIlCZ4pCl72DnfOpOgwkt8l_Roc0uyxi4QHAOU2nfeNpLMkf7NgpPdypr0eWtSkY8-5lfBF5aZlJSI5zJbWSa7HzOkG_ZOVdZDb-65kPtHzFQ4G6_pP8sdXDRnjjcrEwoEOcvzDv9VCC-sU2reI28Mt1is4Q82v-qZsjAG_GnoHqkA0icO0Hu8bbVgmjznAkAkjgrIAhmotq6GEsw0CQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.tf-style.com/shop/512/?utm_source=google&utm_medium=maps',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'TORUS',
  '902-3 Shuzenji, Izu, Shizuoka 410-2416, Japan',
  'Shizuoka 410-2416',
  'Nagano',
  'Japan',
  ST_SetSRID(ST_MakePoint(138.93036, 34.970108), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '一棟貸切宿/Private House TORUS — Fashion boutique / clothing store located in 902-3 Shuzenji.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cEhFsDClEie28qyE9sK_MqjooQA-0PhIgKKspRbIy-pFNf5S057WbnAS8U6-DVPkKQ6iBlf2kgTdxQXoMPpOMvn_y9e6hC3EbMk2c6riwjVlZ-wB2i1K_fA1jVoOVZOWw4b9lIFMZakoYbPHM1YJiOH8JPLwKkb-8wLB77ciSjV9wSExcNr_FzlLP8EXxX2aww7Z8kQVLtJMGgIxavgvVOm87bbcO7VExnLxf7iGxkvFaDcVK9yogQ9NUvuc7Cmnump3qNZb1ZYghvjGzU6U-xLfzw3js-VaIbRhf32ztF6w&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.onsenship.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'MIN-NANO',
  '5-chōme-47-12 Kamitakada, Nakano City, Tokyo 164-0002, Japan',
  'Tokyo 164-0002',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6731769, 35.7182473), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'MIN-NANO — Fashion boutique / clothing store located in Nakano.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dAKTODg8vbiGmq4TxTspqpc57wsLor_yxF6hH7ZW8pHx9LaVdqZHx1t5KCSiWIweF_c6P14T0gPkSjknA2XhaXAzlhOWlPCMbQ0Hh8VLm0Inw8Lrsd-PqL_DPvqc1mHD-jLQgJmzzkAGG1Yn7UGwXyCpJ_NOpTHZ3dHIb2GfXLhJh2nbWiguahOIfRxbWKN3NEkPh3cb5NdmVHvH6t8PX7tSX8mr-22vGMeX3MUJFVvS2odqbsEF6vc-qCp8for12aHvZPANG_VOpcDkbF7GATqTEQR0dM5KsdA-jd4iaapx4ZaBS-VYDAoXgQByoTxyulP_o5YvSEv9iCaTVDpShBxMUHo4BfyWNPOhwoz3GwCMjTNXgcG6U1cY7cEPdj40Zn1AsZev2untIT2_6zS3091AYMlVu_ErWUWsB28IXKUA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://minnanocyclingclub.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'FRUiT used&vintage',
  '6-40-1 Miyachō, Tsubame, Niigata 959-1257, Japan',
  'Niigata 959-1257',
  'Niigata',
  'Japan',
  ST_SetSRID(ST_MakePoint(138.9257694, 37.6640969), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'FRUiT used&vintage — Vintage and used clothing shop located in 6-40-1 Miyachō. Info: @fruit_vintage_clothing, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eH3XT2T9-Q-G73c545UrmnV0ffsA35RGDeDgZiSSal935K1586opN0yjdVFsxSn1wseK-VEKgu2tStusL2VeIqcsW-su7uAK3fqQwz5WdJFZjvPyaCZRSF9Xw9AdHwp7uzT3K010hTrO46OeAmOhkKRC5EL4rf8l41-URiUVQjoF0YxrKv6ZOqy15EiawBnAetrO58OtnGBGgpanLxMNdLM2_txssXupvgsMGTVfENzkzmEvYxDS98vM9w-iaJnkHpWuVPAtvDq7Fdg5uXmQVmL8VUkh2WsM0AtUt62T-HMlbYY6nf9dlhXVEdTXiXyj5ogOLOapJqoYouVoolRw2dhMp9F0KMPAT_wI7ov8MfhZSOLsjrfHjbOa2PJ8sYODvxIkTT40-ZDOKmWZzrBePRfrux6mYTdOZg2DNCFOWs-Mfq&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/fruit_vintage_clothing?igsh=aDU5ZXI1d3lzNDRm',
  '@fruit_vintage_clothing',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Straight vintage clothing store',
  'Japan, 〒951-8112 Niigata, Chuo Ward, Minamihamadōri, 1 Banchō−３７２−１７ 南浜マンション 101',
  'Chuo Ward',
  'Niigata',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.0421538, 37.9240501), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Straight vintage clothing store — Vintage and used clothing shop located in Chuo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ckPFfLjMhPkhbj90yC8_miyjJKxE7HM2CEq3HUcOFzbXnQEjs3nWuBDazFU6cC5lGZooeNqzWXDjGw4xjqpbzxCWXI_rlp2uLL71JQDh-idtKTfJqNlP2lASbvwH146U6G3xBqvqNzgyCkA4ilNI85T4EsF4a1NGZGSf7e2bctpAciflkBfNNjuhyX-GlJmbx-XkCRVIb4XMCR0RmzG7pvk_50-voa5HmXloZA-uKNWcvjsTwFiO6gdOK3KGyBmF_i6ztvF4a6tViyfFWWoymqOvPFh4pNRfmhQpTO8yPjCuTdC5I5xDVY70eTQssvS-GCX_zA0EEmOjIDyeIucP_Bo5Dm_3nkn9UT_rjubGMrHfnarL13DDggnJga15vnsn21-D6vbk76cqYWcMUChm08QQ4kyPHNohsl9lF4q4-6Wg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://straight-niigata.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '酔服屋 YOUFUKUYA',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 6-chōme−7−１１ 千春ビル 206',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7062644, 35.6670229), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '酔服屋 YOUFUKUYA — Fashion boutique / clothing store located in Shibuya. Info: @youfukuyah, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dVkk24Bt86dZix-k6ysFEaqbpJ9Qof-f9Yqvwi91jYBbt7S5J4osPFFoh7nAicx5-UB5_YTbuJPYFpnrejUi5AQDHRt2gOP11IoQ9_hzC6IfBDPxLQAvg4sFhq_5hSRm99_XqN1nrBjSqrjhsCDnJpxzTS0eHsRq3F5_HxQl_-g1zZXTojBM9h4d2fPfm8rO7ELekP-N0BWi1eb2E-_xjGdy09entwSf2W3suMZrvCnuFJVi62kC-Wiv3MZV0tEDRxJ-aPx83h7dpaBa7CYAwiezrA7UHHs-Qc9q62zY3NaA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/youfukuyah?igsh=aWtyMW12cnVrNmtu',
  '@youfukuyah',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'CLEO（クレオ）MEN''S 大宮店',
  'Japan, 〒330-0802 Saitama, Omiya Ward, Miyachō, 2-chōme−１１９ 柴田ビル 1F',
  'Omiya Ward',
  'Saitama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6281759, 35.9088325), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'CLEO（クレオ）MEN''S 大宮店 — Fashion boutique / clothing store located in Omiya Ward.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fXcwBP5QXjW6stSx91cNqbdo_R7GWM_kLbB6IhScPoKazUwjuQOxvqnWMR8EMDzWhUYcDjZFYkBNcBwAftcaU_7HMFcVLPB7HIRc1vOquRhUQmsoF3TmVNHRZ-_jBsLHy8qGSxSSB52--7eXOIqJNMxWW1EuR99670K1yHdWiM1nA71sZlm_nnZyYkWP_LaE59uSg9EsmW7jgYmCNeq_gaIGTxSOkBUup_ukdw_OTdTL-UIrHwad3GDLeItLy0ULZIJMuAG2VbMKfl-sFvkwgsHcNeiLVevkHsGSxCFo1wsv9swc3Dj13dDRZ_mqA2hOkSZ3un20aHjTvWXauzwnkHOE_medDFZ4HKYTYkVv3fmPV5t3ySSo2E7Xoa2t4Z6BtseOn4DQyy1B19KK0lT5uadBGnV3DPqCDORmA5gg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.boo-bee.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Boo-Bee',
  'Japan, 〒330-0802 Saitama, Omiya Ward, Miyachō, 2-chōme−１４１ コスモプレイス一ノ宮 1F',
  'Omiya Ward',
  'Saitama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6286132, 35.9092526), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Boo-Bee — Fashion boutique / clothing store located in Omiya Ward.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eFKD6po6ksyP1lIEe6iMUSguRR3vXzLHV7lC9kebKWlyvcIxxcD0IYFckc5kXb-fS2I7UNx6W7PiUP6FSp_qzdhOb6Hd-npPAeMWNx9I3IDTxUl5vhagFEslqcbrtzvok3-qyulibtRMIP7yvVov48ANoYTjEYtfb3HXIbp-RJ-DMnYSHkTPDyrlyHJWiB2imB_-cjtHu2EBVn9iTsxcxQbfVXFVwv_5iKblP6mMQeSE9X-xMSomnR275PsRIqdNgGfJYQeAE0sc0qWPfqZF6mxaBPfhIE4KQhjHuCw2TUCxseJBg_A-V43rSgo2kHnifT__1Lriho4MMmdH5ggcud1j1PqPfQeDTv_Liu3CTvy0cePotKDuhbszOA-LoEgpx3AzNYpGV1g9T3TADzRDYHjJZQ-vyq1cfsWgXnLmfw9JGL&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.boo-bee.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'BRACKETS',
  '4-chōme-5-18 Minamihonmachi, Chuo Ward, Osaka, 541-0054, Japan',
  'Osaka',
  'Setagaya City',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4986174, 34.6825836), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'BRACKETS HOTEL Osaka Hommachi — Fashion boutique / clothing store located in Chuo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cNWf81IMQXvbJ9JMmc3uIy6S4RQUBjDClohxtp2vHCc4D86y6NKkJz05GHlpxc1xhMLNVFUYYuUTbj2j5Oj-3g3lUHfMsJGoNIdaZIFjjEECjhUQYZy0mfMRByTgTzBD-kBlnctCVuw5EdglvekJBVn5kcXWtzBd-FNq59SWdnJC5xj3YKids5LFNP0a2wA1XpuykPnY5n2Ei18YZCoY_I_G98_9HuAQdDrj3j9N3eiyjjTbFm8fN_j0LstlxjwQ7PgEiYq61vkR4uwRSMjqZa8GnxJZc-2X-EI_KsctQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://brackets.solarehotels.com/osaka-hommachi/?utm_source=google&utm_medium=gbp&utm_campaign=gbp_bhoh',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'HAZE',
  '1-chōme-15-9 Masuizumi, Kanazawa, Ishikawa 921-8025, Japan',
  'Ishikawa 921-8025',
  'Kanazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.6448878, 36.55704), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'HAZE — Fashion boutique / clothing store located in 1-chōme-15-9 Masuizumi.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2d3dgk6Zhjuaq__AoVspjsaXFlaD_g_NlwRAt8f8UuhiBeEII0JbGcenaGy3DXK7cyg8-omu-7apasyzLjQEhRe0g0pjNnLXJu0Xa6wtqLjh35RiTUhTgkDEWkm2niu1ThwUHaw7KAjVMTSPDshb9AgCpRrZ15jkxTtspB59QEEn4hffaITxK1tzQuhPrOcDTlU7ZvZViRJyLF8nY2fOEPv_WGWTcM5YafkicESJYGDAnw0zLQIM3idRkKP69PmmDmeL9-6px94k8i8rA8GGGcQXbwQIF8B7mRBdUf0Mz83zQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.haze-store.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Mode Off',
  '4-chōme-2-3 Ueno, Taito City, Tokyo 110-0005, Japan',
  'Tokyo 110-0005',
  'Ueno',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7739268, 35.708125), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Mode Off Ueno — Fashion boutique / clothing store located in Taito.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eWfXHMtrF6o2Py8iMLVPf5JGVvnVOVYfOPsngI_ayKt3wn9BOkzF8sRX0tcO09YyzmF3YMG2qf-oaaQbHPGoaFEMe_9a7Puv_nuz0OvcC8Y6syZ8l9aVHZENGL2G6ACX_zpuXjLWjRehb-3m6grty6XNg9nZ5T87A_gXy7ZKNXBSwX7Vjp68rlwy--5qCDEAvrKAFs9qZxRWGZMUOnvK6uWmk0QdpLZa4NkJKMVaFWUnYm_j1gDrnrLEXVjt9RU9nnY4i9fLSPhOLmz5l-u91Ylb4P56ReQpyirvLkVV_Jyw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.hardoff.co.jp/shop/detail/?p=104017',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ビートニク（ＢＥＡＴＮＩＫ）',
  'Japan, 〒169-0051 Tokyo, Shinjuku City, Nishiwaseda, 2-chōme−1−４ 鈴木ビル 1F',
  'Shinjuku City',
  'Shinjuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.717776, 35.7074495), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ビートニク（ＢＥＡＴＮＩＫ） — Fashion boutique / clothing store located in Shinjuku.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fCgtyD5yg07_7Zw2XPZDF6XGR_Z3rmm_9okPMLiqERIAmXTW2TjVV44-99Kp5vkma1fa4UheraZm1cg57WvmmkME2pjO8l3mxAlGIw2cPu0gMBeYP4TMRyQ41yGW7ycogWtDDyoJzpPxJps5zaHHXhq5ALR6-eRFPG8IWfmi-Cyh6PfVWEGppy_KpF4YtAFMXHCoWWcOBiagGPx-HhjATPE-XhiTQOP9o9HFjbxLY3MZJGe0pe4e8rL77TBscDSulvAfF5ZDIcndxsyLWoIi_ZHEKm55Vv9OOfF1NwZ8i-fA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://beatnik.thebase.in/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'VOIRY STORE',
  '4-chōme-15-3 Meguro, Meguro City, Tokyo 153-0063, Japan',
  'Tokyo 153-0063',
  'Meguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.701706, 35.6329275), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'VOIRY STORE — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eK75WfuXpykFTKb-aM13kxQFLaxB3ozvIUqd_pk40Hu4jOTvMKKrG4kR5cWl3l1YeJBjwAmwr3XpePSgF5kMAjlFSmaklrba9nj3A5oXF8gSsYdwqE5_8u1oma7R4vR3JkEXxwrkiE0b8hXZIqqrczmEK-3jOv2y1AtaXBH-ayeq9scflbeD6Y4-3agHr0Qea0I57zFOr7f9NQFkPBarqedGFSn69v3mOqdHdcujgn_z9265QMtIH95wfDhYtEMH3zFaWyUkGATvJ4eO4kOU-nH_S2DtJbLXL4jYDo-EXvAsLrW01JMZUlpMJqvmV_JSGw-y0esuPFoCzdGzr-YnDTFKbfj8E_XA-Pu45tMzZBA6Zg6zDttOPbus5iSMPqe9_lI4UK-QAet3hfTORlDsddQIekBn4D-Axj6zpIlgiig2NA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.voiry.tokyo/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Beady Antiques, Cafe',
  '4-chōme-10-4 Meguro, Meguro City, Tokyo 153-0063, Japan',
  'Tokyo 153-0063',
  'Meguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7044798, 35.631621), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Beady Antiques, Cafe — Fashion boutique / clothing store located in Meguro. Info: @beady_antiques, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cE9SigyeOKXqDAVGglj6z6T6ZBE766XPCEimwW27GE1MQWzOJ73Nx5oDpaJ3HRSs7aTFX52KU4e9bOyFhIIecXiQ9B4lrOCcObQ35xBoBPnwx6RfbU3yV1RHKErpj0RmytyFvbzeaeFhOVt06FXu2HmYFpAE3OYNU1AS7Gn2GSI738nCfmjifgtq72vgGVhAllIjxXIIUEIy38CC2MdUz8sq4fQl3eHwpZ3QBch8f3qDMMtyaqlU5TMPlq-x6DnSqeQlZxl09GLxzancUUGVkf37s6n9xA_bNX1_jL6dJn-ajb7mLeInwataPdCRf7ISf7dxjNMPDpxgqMsvzbk2q9ojaSEWh62jzLDGAK-h-3z9elUEWi0XLOWCms1HP5K-3RVi_bjqYWi7eRmb7tezSju5aa427k_8y9nPa08T4&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/beady_antiques/',
  '@beady_antiques',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Nepenthes Tokyo',
  '5-chōme-44-1 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7076319, 35.6644351), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Nepenthes Tokyo — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f8tbMAP82rlbotgg1DZsyJhWfl8_JaATPykKf3eC-tU3CfhijNKfUcOiGLXPCbE1AMiRLCJWQ9U5NQxKzoCSyt1a-_KEmcBH45I77_-kGM7GQISEC7rkbRqA40BfxogPzDwodpriFCM54TCyLQ2PWmGt9Pau71rjSwjGHjAIRjI1hQyCMMSTRt6UG2E0Q7y6RORoi3a6-4rqvGR51fKKO03bV7XY5gKpxCvNlsUqWAj_nUPi83TENLeULfcEb4S0QlGv_duXJjT-Gjdi0rxgCOfGFkNFkNNLuacQZaR_2AKZKbuVgTZUv9MGkPdSCGxURpgdp248IVoLZkNbDDdcXrQ4Igcb8L3tdGkQf2nKIR0I3YQFRWszLr0GXuE9wZG2D5XA8DFRawR_4HCXmu2sItJglVkc1MEA22N5LlPbpbug&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.nepenthes.co.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'TRAMPOT',
  'Japan, 〒152-0004 Tokyo, Meguro City, Takaban, 3-chōme−18−１８ ロフティ学芸大学 1F',
  'Meguro City',
  'Gakugei-Daigaku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6828014, 35.629232), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'TRAMPOT — Fashion boutique / clothing store located in Meguro. Info: @trampot2005, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ekfM2ICiWuOcpn-CtWvn4MgxFz1H9gFgo6qCXUCUhzkqnsLhr4TyHbhycup98tm6lI-4BE9hJIixRsHdwfz100ZyB9XM25mHFs411h8OkCsybyPEyP7JX8dyvbA5_qOfyr6DqLw8uXsikgIICp0AANJwg9oHqZtkdGsqntSelFTC_GEvfovji0x1b5zRbdQzrlS4_M5d2l7ueJWWppNvZRpBgKBQFgW3sKF-NE7_oHrtLmGVzs80_G5UZ2DNgS0XG22uWOH70MGsPlgHgQZY-nsUFqngxLfLhVNNrMrd8M7gHPJq0BWW2cGlHx8jyIzlcYvP_iokkudR3Ps5r8gmyPU5Xd8H4dK635icDQ3HnCLpUgAsZaqXcwVpkekUbVyVaet_OHuFj5I1O3EjaBJUiPQpkmCeFe45jelvABQKd20Gc&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/trampot2005/',
  '@trampot2005',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'WORN',
  'Japan, 〒152-0004 Tokyo, Meguro City, Takaban, 2-chōme−17−１１ イムーブル鷹番 B1F奥',
  'Meguro City',
  'Gakugei-Daigaku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6868797, 35.6271176), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'WORN — Vintage and used clothing shop located in Meguro. Info: @wornvintageclothing, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2db34ANfkHp5CWYz7VoYWgHiwxD5uKibwfcXpUuxCxHjCxrBsOIouzNaeaMWHlpiJPWCmO96kZh_grBwE6RXNyNgV4LKQqP9bsaXZnyzfFJxONR8cBXsqJuBDwV-Wf784CXwBBjV4ADYyoEHyrUZNfMhlEFUvfAL5Q8tpLqb9L9prx0xhVGvqqbxEYatl7BUEspqfw2ResJxMA_2p8J0X1pKH4KvPLg3XU5MUBaucpQ3-R4saQxybIOGYDtfWGO00HeWs_euN4L_8e1yzs4f6RHtz63qnnwEdAyZ7da_JTCvlYwS4fFQeTWUsIJ60-b-Hpe_NjMQlyjHa_wNnL_yc5Iksbjbe-3TD5ti-_jyO3fJ1rqe383Hlrx0cAC5ZUZJ5LfcETJmLptnFWEkawAVtFPAiDY2wr3r1aHc2-g0HtjkQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/wornvintageclothing/',
  '@wornvintageclothing',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Risaikurushoppu Bekutoru Yutenjiten',
  '2-chōme-20-10 Yūtenji, Meguro City, Tokyo 153-0052, Japan',
  'Tokyo 153-0052',
  'Yutenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6928425, 35.6356031), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Risaikurushoppu Bekutoru Yutenjiten — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eHKBM9FS7sC8959napikJihe-QpxfGqEHGlNjUzL_XABm9zGc2LwN7d3QdDr_a2cDTvkgcR0eR2ENIJIlZbpUTd8lRc0zPVn2aExOcYj8EK3dbbG0v55IvDmqAxotIbGL0HVJ2begHx3C6n_1EYHvRZL400lb0AhOepSeMhXqbdUPpSg4oq-KubT5jp8ph9iMbYEyhl0W6XZvHNgBmBdBSQr-VJwLecz6NvdQIrQX_s79ycaq-ClN3ouJ9jQuUV5ODofeNTtuBfEbShSsW-1RDiknKoBE_i6wqp-idG0bc92gFQUtfRcPvCXb6a6VOOep0y3f-KkJqeqTBaSr8Ix_vSIQcS5TwTJJVvMz4_A4GkgKIH62_18HqsMcV2H0Q7cFz8VuZ8ygDqboN352OnuK-kjEndwFUYf4Y7H2eUKIOH6I&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://vector-enter.jp/yutenji?utm_source=google&utm_medium=gmb&utm_campaign=gmb_yutenji',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'KOH''S LICK CURRO コウズリッククロ',
  '5-chōme-7-13 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7087548, 35.6662541), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'KOH''S LICK CURRO コウズリッククロ — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cU2ILPln_Ba8Qj59VlwOyBo2cYG2xLfXwHZW3OjjgfC5S44Y2ZnN5hbjL_NpU_AVKxQ5DdIX4qbenA_Pzxg6ipv-JHtBM5NTGQ0ITy4UOukPlYPPxVYGoiyF00aY8DEGXgTan8e6RzNfRi_THAZSmue1hZ5DshcXLQVEPUJhTmRSVLddKQBvKlYsZpAaYpi2F73CJrmcqFvjOwTgxN4URYNmkRkBAiLLKimGeCnxf8XQYnw8j0YukSTdoVhwxLtbIbwbgt_Elxybp9_GtBmaUkVtBoVe2Yv92TK_mVbCvIqz_XIobGjuhgZxxqtDsCWhuPXPIDgpaKitKnsUhcFgYT-hmtBmBU7B3gHZaUIOs7JF2mBhjpF6L6QS9Gl4HRfLVKXrknAKO8KdfN6Dz4vt5UksNjVppPFutyPg5yz-LUNmMh&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://kohslickcurro.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'TOKYO PiXEL',
  'Japan, 〒111-0042 Tokyo, Taito City, Kotobuki, 3-chōme−14−１３ 寿ビル 1F',
  'Taito City',
  'Kuramae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7930183, 35.7063456), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'TOKYO PiXEL — Fashion boutique / clothing store located in Taito.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fseVfUYME7XCFahn5vLdtKWxYhgVvo5eDtX2ibGZjAvbvZthOVj3d-q2G9YL3fX9nD-WyIpYvqXrA13-M9MvpgWHB_ZFEL5_SHuWasnSYtRZOKoOQ1Sf2jsdHIOvyD-ejoJ76YzXNZww-nNYmYig0pme8RzMgUAe8pSdBcYoBZO1GPL2Nh4ieir_Mx2Pn529lBlVBmphrFcIq552tZ6DcVr2c_tJ1cGFNKNHJa7mQe4mCon6-OxsVbxdWugbYY21bq1JWAe_BHIWszP5mvCcOoN_VTf9sDdYMNsMBKr8hTyg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://tokyopixel.shopinfo.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'KONCENT',
  'Japan, 〒111-0043 Tokyo, Taito City, Komagata, 2-chōme−6−１０ 1F',
  'Taito City',
  'Kuramae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7956549, 35.7078124), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'KONCENT — Fashion boutique / clothing store located in Taito.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fBJcrD9c-rqs8Il7gL0wAuCSkS2A6fc4oBNG0pf30vI1ap9iQM1478GumBKXSatXIA4ALJsoSZOzvH4KnFu7mwYdaIVnDFwH2m52tCt_ZRUL7ANATMyYy8S4FALRmuOmbyw6WTtgL5Ygw4GuUHqYH_CTfNuHaoVwJNZpKp5JikcWyHSMk2_j1GG8Rl3WcyMp_DetZpuNrOiwMkqY1MbB0tqWakg-4O__lDnYOh2Fb6nvyNx3oz0T7Q50WwUkMIHQn7XZf083p4tSUANMvTrUpT6fZuvP8lFG_LqClYEIz76g&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://koncent.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'kakimori',
  'Japan, 〒111-0055 Tokyo, Taito City, Misuji, 1-chōme−6−２ 小林ビル',
  'Taito City',
  'Kuramae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7857206, 35.7031714), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'kakimori — Fashion boutique / clothing store located in Taito.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2d2cTYrl4BF8_ANcKMewA6xWqSK7hENWSn2bMyIMwco-ctUx-k6ZrL7MD7_q7eF1SwwHWLQvnd--NixxRhE6YqD9lOrIEJBKIQWKWCFuTP7BQZesdY_yzx44Lx4oyTvl42POiLOkU8yDZxckGev3MPghSwKZFLSkqzjVhPWzaJyb_MBsvu9a6A5EEblRHeZlEyIY3wgHwfDttYK4YU_XtkbkATQiPo7fGwHaADs6lXUS5rD4mnnoVvGGo7vAb7TkivHc7Fb7l_GyTdrrU_6EQDsZ2UpTc-mbkveWxrpCVbcjXy_-Tel64ky3WEDDYgrwFeJCMl_VCXxH9HHAKWZIQfwMFAsw6jQkyJCxrN5aEcb155-O5qoILHskWLsE6XN90LJpgqC_OPGJ4Rt07jj_AmPq49qHKrFrA3wkVBcdeLQkA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.kakimori.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'AMPLI Vacuum Tube Laboratory Vintage & Things',
  'Japan, 〒111-0055 Tokyo, Taito City, Misuji, 1-chōme−2−１８ STM三筋ビル 1F',
  'Taito City',
  'Kuramae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.787431, 35.7032707), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'AMPLI Vacuum Tube Laboratory Vintage & Things — Vintage and used clothing shop located in Taito. Info: @ampli.misuji, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dNhWCgDnv_LUs-0ioMsFEdy-MHOGrOnn_GmyJQCs5wWiEPiJ_NwIBc9YITTMzMdTrFES41V8JuvA-C_Yj4rvmbIJnb6ov5qaI9vlGUqbSJGbgFztm9TmIjT01Dy_it9boz5bkjYVsbmc2OlRWs6-I2KqVqJzIybqSHO0cV25Hw6zS7oRHxEzcxsQLkAhOOusS60VkdwFRV3C9W38Ao-HSaAB7KyQccUNq7C-IKFvEdfl6opSmq95pE6Mf3NqZU-ZWryvZ0_mzkIIVWBu6Pp9LL-IaIsVlNuTx5IQ8IJiEbtrq3BoOYmVmgVAGTQ_A6KCxAjib4B1L8pj-LpAM_1uBwe__rOqD3BJDmumlbOR3WtJi6ddTXoaALctzhdwQQn78zB9j-uAD21jH7XCm_mEoCUyzPUOU5BY6wOi8x7Ig5F-x9h014BvqS7tvGEw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/ampli.misuji/?igsh=a2twYTIwdmQ4dGFw#',
  '@ampli.misuji',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'raul general store',
  '1-chōme-4-15 Misuji, Taito City, Tokyo 111-0055, Japan',
  'Tokyo 111-0055',
  'Kuramae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7866145, 35.7036191), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'raul general store — Fashion boutique / clothing store located in Taito.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e0B5Km6IbDzt4zla_0wFXDfNYKvxh53L6dSiwRqLScUjSGxfHhskAJb1Wv5wKdv_rFx7A4i3yhMNSTW0oSW9AfN2qXoEyQrQqCM2snbEb6VM1ISBkLdGahdpRaYPW9CCMIY0JlTmQkjyo072tU8SWpsKYVJN5QtF5nU-1BYlrNixS9UlwGu6hE-XWswAy8ROv_prWDxXdSTW1RlismKYRCJiKlbEmaLVK1x9Dslk49RNeea621zMFQUbRrQXFI7Ppe7DXXRby9dT6tyKHY3J9dGcIOb2P_t9IsOGguaN_eMA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://raul.tokyo/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Black Ribbit',
  'Gardenia Kuramae, 4-chōme-9-7 Kuramae, Taito City, Tokyo 111-0051, Japan',
  'Taito City',
  'Kuramae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7889273, 35.7026777), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Black Ribbit — Fashion boutique / clothing store located in Taito.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dkmMRN6K21Bgwl4q6jl47hpojJh_wBsJqHZEsOhBM5WAOiL59AD8v0JA88Sp57OyCZtNh7Vpzt_h8kcdClBux47Rvrfc8zG-XDFknsSmc8_dFQwrPAFtjNXv7OyYufH3RN-CRV6Dme3LxvcvtEu8LjMWUWFWEe8UgjqaUuaRwtdceXWMrgODqlUtUf5Lqy7ngYntjv8gEKkr_X7YIzhrg6cGU-MPDjunCPq20x52SJCuH_KVlEIsGWreFFGF6-JnC-3ZCLHgq9m41GiL2EmnPzql-XRmVOkK0Y-J3Wa3YLfzjJJxAoYy_MQSjorQzjvFWCQx_rR4xKJjFKeRE7gW6rRMROwkracsiL8mPE-PDlOmyTru5LM70zQYld-A6xKEKTeQJ1QyDyFNG_DazBjhxliDOQ82VBRDoAMnPuD-Dwj0DJJh6O0rWYB5bOQw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'sick vintage punk&rock n roll gear',
  'Japan, 〒150-0041 Tokyo, Shibuya, Jinnan, 1-chōme−10−７ テルス 301',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7012291, 35.6631478), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'sick vintage punk&rock n roll gear — Vintage and used clothing shop located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cmOcfvoZFcCAWXsYyB_wxhtbbjqI069SC6QpI1oCIpcVGcxn_cXH9epGhA7tXsnepYYjVsrO2o9KJOyVQJMhy98idJX23at-yeXMdpeHAtVxrPImglEoRIMUsPv6hjtyC961ooPsVUmMWrSLXkhhKLQlTDXinlbd26GTs3egJm4zGV-mn2enRx_6q5NNPOl8XFDXT7Sznr7ol7idcgmvroRPeehFHdcACyppEaVBzPaCXjlrEJW69gm-WqRqhz4sSI64aLh5owC-wH0A_LFd0s8KnAU2bHVpFxm37LWe2JopJiCjsz6x1KDJLa7ykoaiayJaPAbdn7YRJv4Aq_HQ9V5kMK05tGVxsyYWxgkFUDlXB_g5ErqJ3BZotCbtd5p1AwaSNlLAwPlOoYRN7Mg9pUNlGh5sBWVhk62kPYAYf2mdfxn49qLWsq5b2JavlH&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'vk.oregon',
  'Japan, 〒166-0002 Tokyo, Suginami City, Kōenjikita, 2-chōme−8−１０ エスタシオン高円寺 B1階',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6504301, 35.7065857), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ヴィンテージカイトリオレゴン — Fashion boutique / clothing store located in Suginami.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fLRiEfSxNf5Ma63bB7kLdm1D89kcBv8utd80ZyxEKDqJx7FNYr9Lo2dPv0KzfXIvqdLITiT9Svb_bfE9QPnmwtO6F9ML3mCH0T82-Oy5pbrf2lkXZ-mCwPMOA-duWDm2YylwCDA6ctrMYu3sgsxcj2vfH-Bb249HCK7GstlQAl3jjmV6_aBAvj7fhZYRY09-d3Ok9SE_urfJaYsrCEkNrAcvpUx_ofNba8XojCX7t07l17AAIOiH0Qo6G2q6wdE3G85yCeKmXQtP_GkAFFenhUG4YC_lLa_40ksL-1Z0xkSA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://vk-oregon.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Prophet',
  'Japan, 〒604-8066 Kyoto, Nakagyo Ward, Iseyachō, ３４４ 芝ビル 1F',
  'Nakagyo Ward',
  'Kyoto',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7663147, 35.006876), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Prophet — Fashion boutique / clothing store located in Kyoto.',
  ARRAY[]::TEXT[],
  'http://www.prophet-kyoto.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'used＆clothing memento',
  'Japan, 〒260-0013 Chiba, Chuo Ward, Chūō, 3-chōme−4−１０ 野口ビル 3階',
  'Chuo Ward',
  'Chiba',
  'Japan',
  ST_SetSRID(ST_MakePoint(140.1219689, 35.6085745), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'used＆clothing memento — Vintage and used clothing shop located in Chūō. Info: @used.memento, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fcujlf1PpGv66ZeHvhZs37WZhzvGNFEMb8OqzCdJEmiKI3k1elbawHcGaZSO5t3tVMuLJxJZbO0PaH4UJJ7SHizR59cg4hba4UJTfl496GvZtWsK7bOYHFgAFIB1YmflZ557vngmLQIP8u1pDnIFeArQ9pKFfRA-Jp20Y83kqhEWDq5nn4F9KlnDX5yEjbmQYAIhBtLkRIfalBdYIQmHdrhzyYAA23N4B30RqHGdambqtslhSv6b_5qu_Qk3gZu9uQ6TVm0Ki6GcvhUN55mkmi_7ZCzyxV5ADt1G_TFtvxiQg7L3NpUgB8j0QPN51X9SF836wI1RWisJAz3o5E2WCNnFA3gWsvYddgeL3Fy-TnxJEu14cY8TPF8LTl3N5C8XWzbMUhq6ibcsMWBNwIsyTW8Iyi4ghhvR3PkQ5zzrAm7g&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/used.memento/',
  '@used.memento',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'SixDix',
  '3-chōme-9-7 Miyoshi, Koto City, Tokyo 135-0022, Japan',
  'Tokyo 135-0022',
  'Kiyosumi-shirakawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.8052223, 35.6811932), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'SixDix — Fashion boutique / clothing store located in Tokyo 135-0022.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cFVdC5YqjTwFVG0z4lT-0XiFiIxfpIQAjGCrie1anYcUe6CbTNhCbxd35bmnd8JljVCd-zgahPijBUaFWoOv617VDtlzk6RhIXg4oYY-TX9feQdhMDoqFU5ARi1N-kmcByzkaOg-xzGaPYzmBuj30wGu7ICXw2fc-Ve7dpOxJ94qlkRHi-kyO-JX-NXj9VdCvtKV_gcgCWa4l_4HqJn_Hgan2NwX5JSdWbzOpYgRTOSD_YhYYrxDZvmp77eEfhEZpEFE-o49QDmFa2q-_tXTbZVaXU3XLjjZBzIKvqUho&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://sixdix.official.ec/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Taurus',
  '502 3-chōme-5-12 Nishinakajima, Yodogawa Ward, Osaka, 532-0011, Japan',
  'Osaka',
  'Kiyosumi-shirakawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5022215, 34.7267131), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '占館 〜TAURUS〜 — Fashion boutique / clothing store located in Osaka.',
  ARRAY[]::TEXT[],
  'https://youka-uranai.site/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'CHAPERONI vintage clothing store',
  'Japan, 〒135-0021 Tokyo, Koto City, Shirakawa, 3-chōme−2−１５ 大竹ビル 101',
  'Koto City',
  'Kiyosumi-shirakawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.8050651, 35.6813927), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'CHAPERONI vintage clothing store — Vintage and used clothing shop located in Koto City.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dax4OefIfInEVWrOxSjirNG7zbaP5_3cthAGOcUxmpWNdSxFhCRk0nXojdgECXhB7XfI9aHbZC6Ph8CkzMTTYcR15OxL6g2HMo7hYbptHuDGQQ5uG3y0KzIfGCiYSSqPDX7ng-tm92TcpCJ9TrEn2KHeE4RtSTpLOAElbDKInXKFFsmz64rf5qUqXYZLbtxpOaA2eAedADa9Jxrta-KPShwA68hrSOkEPeDiJYf8YYZWSDX6Kkl6mz3wsPfPjpW_aGE2_UOq4pjC0VEdvM8KDhG8dbduRflJNwNrLWUrP0r4NiozmvWGuwJvcAZD_BI8UaHnvO3NCLeNyr0NSAtQ_gEOTTKU-P7Fyf03PupjSC_57MMUk7M6kTYjlcR_Mq5vcy25UwjfxWPPUccDXzk58Cpg7ktrJDc-_WSLnPFVg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://chaperoni.thebase.in/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'FAAR',
  'Japan, 〒135-0023 Tokyo, Koto City, Hirano, 2-chōme−3−３４ 第2菊地ビル 1F',
  'Koto City',
  'Kiyosumi-shirakawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.801259, 35.6778147), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'FAAR — Fashion boutique / clothing store located in Koto City. Info: @faar_tokyo, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cVrGLQ4ANofKpx8cLMApTi3AkvR8IpiZyDJq-RjE0xkzuRvR6RzCeQE0XH4XWvv5a6MeFn6MJBCJfyxOWfiCd21wbSYXTC7O5ex3DnaSMDJEVRJjgK1Kk72IgD9AAe7W0mXM_n_YRGyLxTeSrDqMgFbhQOXju6FM5DrwNICsWrhzVIS18FIIh6GH8QWOwCVJip0jDrps1k7w8zwfYlWssbqmEjSkZpo8RRqIYzGi3KCjQndDsMRlFcLi-4R5GEGMY5iWNA-KxnmQ-FtALkDxFMrdiUlTXfiVtat0VT4P1cwtRXX5iDUhuf1n6Xnc0tPpgaWuoC2M-g8JN9tIhnEGa0tZ_t4L2waGVDSrrjiSWUFM6PLeqah2nTMLrU_5WPNe__E3i3P33HwdVf2SC1NremJC2wS88Jb_4ZQUsFlwAIbxQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/faar_tokyo/?igshid=MzRlODBiNWFlZA==',
  '@faar_tokyo',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Aum vintage',
  'Japan, 〒154-0001 Tokyo, Setagaya City, Ikejiri, 3-chōme−18−１ 池尻店舗 ２F',
  'Setagaya City',
  'Ikejiri Ohashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.680431, 35.6497792), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Aum vintage — Vintage and used clothing shop located in Setagaya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cA2EHodXU7ACz2gG2pQQggsC7EzLZ3cZs77a91oohCq7EnjazrlSW4idva42Q7ZXI8cQTcqgbyP5O86Bds0QFWpDpSMkLcTRHznzk9iUrZIXMB5ZY8KEKjGYzyZx4ySYjQjd_LiqIPYSXH5DhVO2xlYH84SnB0JXcHPobhs5D35vb6yahsdKXzcEDak2z7CucisAZwM0cOiXo07OjixqvJy8preKxA4YvXh4puyGeexT26IMo8DMPq__HIXQD2MuYqxBnkAk8RSmhT6-Thm3uyPf4c2H_5DKJ3sadbYqcN7T_hB1rh0Awhatc-nSRIo3hYqqN3DsL7fv87Cf-N_YWEEn-aSATN2oeiayKFmlqNCy5_e3dfXo3A0nZ-uJ2BtaZLlF27ttMJ5QKvnkoI37LdrFEn4lKkQoB7T_XTs-IdRVGd&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.aumvintage.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'BUY＆SELL フクウロ明大前店',
  'Japan, 〒156-0043 Tokyo, Setagaya City, Matsubara, 1-chōme−38−６ Ono Castle No.1, No.2',
  'Setagaya City',
  'Setagaya City',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6511, 35.6688797), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'BUY＆SELL フクウロ明大前店 — Fashion boutique / clothing store located in Setagaya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dQ94F9elscjTOQ2k3LxGPaxH8cpCR26g9Q1QrqnNNu35PCZ_1xdAbjhwTP5OTGC15n7K6jGpuBsrPh2khlDQKvXxfGWc9ITRnQjptaV9KyvFe8uZmXREXrT0Ngkaw7oh6mHyyzvrZnx4fb0JVALcM0RPIgJoG4gN-Q7NSATGOy3mwR-r9e-lX5NkUjKGlT0QVnUKJ7RsvzYYODQIWb6lOhJqA6Hr1w-ty5L2sObzzK1_7keu3fwlJ4q-8d-9GEGQk-9KmsX21tvKyM0lzikvgnpT9Vo03w7hkX69ma3_UAUw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://fukuuro-kaitori.jp/shop/meidaimae',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Good On -flagship shop-',
  'Japan, 〒150-0022 Tokyo, Shibuya, Ebisuminami, 2-chōme−23−２ 恵比寿NH第二ビル 1階',
  'Shibuya',
  'Ebisu',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7099312, 35.6422795), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Good On -flagship shop- — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dbBxVzIJDjAygiyLdLEcvU_EoLO39GOOfjgAQQ51Qh2bQLXyRSYTSNyCzO-h27CIsc9ToFPdF4nfdbVQCAcyoPKqPPII7ISVMJOhZO-laZbtb9R2U7kAOBa7XY0bldItagRSFWWxjlOld2FNRe1M5OhVNeJa9Q8IDsY2fwZF7KfgqJAzCXf3v7olcTKBm73z2OR5yQ5R1a_7rdB5JYwmoC-T3DCOeYw83UFSgduHr615OVx7ulnMaOD9nQhmOTFP5JyaVdw1cBmnRJl7Vb9gTpHNPlheKOnEln229Z6e4Yl7kJg4zCTWmDNbAyTl7SpGdK9H4QV2gMxRw2GAzmrG0hhM2FGVptJv7hLjbUsSoJZ3BfQ-CoL8gi4u95-DSacYcBJ2EdPdE0k9XuSA9swOPzokVVGZH80uEfcrz05ILpDA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.good-on.com/view/page/flagshipshop',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Portration',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 2-chōme−19−２ １９−２ 1F',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7107488, 35.6737315), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Portration — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c4OnOkLGO0yZc9DtK9ENPxAu_kFWejIDDsktZ4V9Vaj1wC4ZgOmE1AK0vA1XrgD11DUBti8WuPjlGt1OQzAnzkaZMhjjqPQEq11NIVJAlo4C9Kdvc-WYSP_740wVM1FJO7RywYhQAeT8PuA821QpFgaNr_QkeV-QIW7ChvWUCRU2h3hfQbFIUwKctJJ6JqnZEhw3237Wy5gJ-RUlR65V3RuoiF8sLMoQT5B0YXZO7Wk214oLhxh_rvn_5b2mk1rfE5NrH5q9vAFv9Z-8197U78Qrutfug2SbPu1VTlWfX1vw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://portration.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Trading Museum Comme des Garçons',
  '5-chōme-10-1 Jingūmae, 渋谷区 Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7069192, 35.6672187), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Trading Museum Comme des Garçons — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eJ-pOnkqVVJ26ooMP2t458YCsT-M2MZVjGH-iJZUVXZgnIfvnWtfZfTJj6KJgZMHy2OBTE3R3QzKogCBkkZodlkzN0RudUntda-7yT2TU9STXIu15Ab8IygmXQvm4Mu6q2QQSyTyr_1vXJVAcynNxLUKHB-hwkvTkwl0MreXOg_o1ZnRKI2t-thxhkGVODsBMn9KUuuQEYCMkwAmLAaYT_NwNwAOZbKW3qX2mvMgUYtbyKcSgfH_eYY2JJkjIZs7M2SjiCtTKP5cs6Rw2fNbDOTEGmqPuXDHUR1hac3Rys5Fkdp-6NcxGbksminrn7SuV-QjhlRajDEdxwvE4_WFeYrETbp8Wrxu0Lek3LtkMOqiwIJJr3B6efJvtNT06i3z6HECQHzmEkJ5nXu_JGdsClAhRfRGOOgZYKHerjhJJVCZnd&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.comme-des-garcons.com/stores/index.html',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Christopher Nemeth',
  '4-chōme-13-5 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Omotesando',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7101305, 35.6675656), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Christopher Nemeth — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dDbGvFvd5Fir1ng_iBLwZR0ejuz_FB3965KngdFf2OnpQ9Flb4wbA8Zh4QxzUcg4hz33-sVGEboUQLekUILutlLsQudPfurJthIGIsy5O1bNigGHbCzpn9Qgs54yGC-08CGbf6zzigV0ULG2tP1FwTXT-3wsj_Qx9kKyZc14Aih4jNPXFUMseVxk8xztm11cqdmZWCbWgB-ITpvndRzjDF6ActWvLaob6N6zeBagzP_7o0j76wTMMKdmERmum9am22_IxKo65nt-pvrehy6yHjJFuLUBn80CjQvfa-E5AexAv0y_QyjtUtLcQBV6vqL7tk2OKVFdFSyL5Brbk9VKmeCqmjEPhJBlkH1bv8tTYl6f56Kub60aTAXy98WrZFh0bIzEZg9X-lE-VV6m5ccLNKOXVbWWfIy7R86ny7v7sgmuUZ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://christophernemeth.co/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'kindal harajuku second hand store',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 4-chōme−29−３ 表参道ビル 3F ローソン上',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7065213, 35.6682619), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'kindal — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ckKK3tyj37jMrPKO32yKJuaglZ--wetSNtXoKU4DaZ-OhE5J0jjbPGEd7NHMPMT5OqGIgYwFJapvrlSuS_iMEArO_jf5bW-3jlc92tr3bNse_Eb6IXXD7A40oBRDcaLGLYd2mKjMmiN6x-8uYdMDnF0QC0SPvhYsL1dieiPU1rSk5FdCL4-5nr7Hle_IP6jrhVc0deHflGCrnC5CjM7Mz9XU0slmzzdcSYXXdEKm6C5oMDEMoSZ8YkWh2nOOOUACMPI_qZgArdij2Z0JI-HBPKaJ7eLhCy-NiLkaaB02tYew&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.kind.co.jp/harajuku/?utm_source=gmblisting&utm_medium=organic&utm_campaign=harajuku_gmb',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'GR8',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 1-chōme−11−6 2.5 F',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7052181, 35.6692707), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'GR8 — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dCzyY7VjdsE9Y-J7MkE1rfdS0Gn3nGSbt5GtOE6nYRK28fCujjCRlmNLhlxwVjIzOXl2mYGjusvOoBYkps0pB4Jntw3xOh4To_JxTENwBEONuBks7Flj_fI7mYsvsrFyv-8AfhIwV_WA8w-Iid2E8mMPBg4YFHatEapmeeFzTPK2vluosKyuLhwGhhWHb6j1GqBi05YD7Ymd2i_YpdoSMY2-fXWX-UTdxHcJy2SL9uVlcaDDAFX6j0GE0TQM9Vp746yN1TuSIhNs0WdppgprQ1Bi0Wk5BO7OVYgY_A3JuM-kb7JEnVimS7VAxOpi5jgEBRA4XGek_Hf0eK94YjidCmqpxxDUxxsXKpzt6RpWyMSGWWhFx6FBlZi8OaPtVQieBLooVeNNlZmVinN2_Xs_anoDhBv7Xmxn0S4HR9lAXoQTj2&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://gr8.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'TOGA XTC Harajuku',
  '6-chōme-31-10 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.704124, 35.6686182), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'TOGA XTC Harajuku — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eoKoh5uy0-8YwSjn_MrRXN_6vKlTTwrF5w4_kiQwrVne6hrbJprIBenqzPx1AyuH4cS50yJtx2lRv--a-PpsEdPvOrpwTWwtyQW0ZqxbBNlFg0tpVBeyoNhAEjUJxdPGc7tstErP4R2h79ZUgwoDtXLpzAmU76OmKQ-iBzEfCiYpWxQCMCuZSHr9IjRF7TZdltSOE63NRa4HaDHCcbV5KTtWzh9IFovLKan2LHmx8wTHlKbV8DHZfAV11LagNcZd2lfebHp5FxQg8FQOs4MbH4LICddqA1cr1RoUdg39vZLrBgmMXCP4TilUOjWxdUNBfA1u4oJWllfh_3uftCIuTzl63eEF1Y8PKU8KVByLxUFSaSLnEQJWgEiVX7Mncp7LElodmlZ1bV5BDwAvr-WARUoMy45nbXOq78ew1XHfMABg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.toga.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'NUBIAN HARAJUKU',
  '1-chōme-20-2 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7048515, 35.6717279), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'NUBIAN HARAJUKU — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cmWbHv4GoUjV8iNs92D7-WwH59v5G84gXLzesD-_lWPkkPcrR_I5WVlKqbvgDxzh-NMRzNsY2we6SfIQm6ybAFfgVoBu4vI4of53Ea4vlf2EM9KAvnvbHR7VASf119l4v8rIohwvQZtbxO84tTDhnwPfVmuWsbPGvpp-ujSTyW3vr9wh8kCO_yyxuwQT5q0-FDrqZhqnnh_QvlpWpXmU-ucLytvxom_EVV4FWIx60r4L5FJ1iFvGuk5VjobIAyL8krAJku-zW3oQO_vEW9n3VyvXStUeZoyBkgpk5jW1HrK2mSeRtK8b3StKNu4L79_AUBXfBkmqTVlSLmAQf1x8v1GO-Jl6qfG2QzSmDlls3AJGcSB2cdDZ50BBqfIVAff29t6HhAX7avLpgAP5lUQx6JCfZO-Cunhz3sVzzZesWvxQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://nubiantokyo.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'fethers goffa x',
  '2-chōme-31-9 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7088185, 35.672895), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'fethers goffa x — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fgc9efKJ_ytu8d2Fq9Cyqx0fL0Et6bWaFM-U_JP9LpZj3xS_hD0PdVcdaJPZOExDmKpkrH2H8LQjoCNqYgt34F6tfKTPuJyu7ya3dsDMBybQBuicula4pNaca3ndrnpCgcf-mfWOE_KXe6ajdioina6smVUWlloWJyWgWqAS4EvAfe6UIfn-7wz6yxP-k8dDrvif6UV0NucLXSlW81P-mLDduW2f0TyErjCh8ZezY0N0PkRZjdFo3AWl9m1Mm037DO4utOavBOrV9PNGmYSnF_iFEUYBvaMu58V7QKT5p8Bb_w8GzawZbiJssNrPC3AKjPuWB8K7ZeOYWQ9MzsPgHv4f4Kl8bKqgWRSLEyVZn5RyXky-r6Lcc1sqr1sV9le8vg1lPLo58vAa__ZXRf7iXez4Tx4vLMbGgTopxlAoUw2oxa&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://goffax.net/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '#FFFFFFT SENDAGAYA（シロティ千駄ヶ谷)',
  'Japan, 〒151-0051 Tokyo, Shibuya, Sendagaya, 2-chōme−3−５ リリーハイツ',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7086747, 35.6753897), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '#FFFFFFT SENDAGAYA（シロティ千駄ヶ谷) — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f0wqFGJnLxlU2NuFdrjlMOfpnepaaZq7LW-WLVauPHa5icEBJW06uv8j4COEOrtDLofahP0Bhox9Ru3OtT6M4MGrBINjBiaqXi6lTP1N5W71b5vnDjOsChDT0TEfEklFj3nT2bnb-0aWSF-bJfTm799sXVEPm_a1JukQaQQk29YcHJFe9CYgf8mCUr8Xkts6JCBxwbgTU8zQrTNWcqD4MpitcpCQ4J1zKy317yFLk04NKCyY8UHFmajesFwzqD7_ONx382_fI8bf8RchDMAhO6QrByakN22oND-4WsRQJwuL5oHXRZ7oE7SaVHIoiWfKSjPQLDVWJefob_wwcpMBd8ZZizUvj8BVGLMtF9lIe0MYCyKKtMVb576zTXmbX9iDdsAxww8ohNYmBvnKoEZT6ZFkAN4ANYMfAMYyopvVQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.fffffft.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'BIG LOVE Records',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 2-chōme−31−３ 3FA',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7092311, 35.6733514), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'BIG LOVE Records — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cOJqN8SrTU0jiOZbWImeCNJMEdds5Ho0IegDiB65Zh_Oi-abkZegNhe9ROzIDUxSzQODtd-Bb_P4rrtRSXrMJLEWCj1Nto9fTWldS7ss2ZnAsD9rwRYkNwrJsC9zWRzqyj4p9o8jw-PFlU8jK7YvT1fDYBk5fE8s5CXhVfKColxZkkCtXJFSj6WS2DMJIy-WxJAXvd7IZlkx3ZReshzAYBDY2Ardybl2MMTKoIwVyNNyCNZnTqBf4GC6aC5F_zx5oawzsi60VlRP90t-fTdCM044Hc37LdGmWnDZBkSEfXTUgc_cDNjDL5n1dXKOTmDnFq7fnlZoWhrs5uykl5efsrekCly0UQ526N_LEiPceQ3NgZgevyPcGrYLrNoI7inyb3h7Xwq5UqbW2UPgYrMvHWNK2ccelOSJb2mVSYIMc7tDev&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://bigloverecords.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'BRAND COLLECT OMOTESANDO',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 4-chōme−3−２１ 表参道 Nodera Bldg 1F 表参道A2出口から徒歩3分',
  'Shibuya',
  'Omotesando',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7106383, 35.6672043), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'BRAND COLLECT VINTAGE OMOTESANDO — Vintage and used clothing shop located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ctA66MNcFGdRALw7g93DSJx-QDsyyobgvDe88TIq03nwx_SZwN1EkbkYR0QxXqQRhsZIadq4EESiCh0a8b0l-8DIaJGpjU97bxoNXAjU0vB5QY2kn78a2J-WEVZuvyly7L1av0QxS-X87A7Y9lturAafv875LBRaAenoESimmf9Hl7w8OGGVkFDE88U-e2npw-JQtV4msV5vWeMhKQd-nvGOKIKC8n2M6MonUyS7x3MgJqRa15kBayX7hQtbDIX2uifwDWzqbzkHTm2l1vrmj9kqVh_iWxjZVhOeRwqtKhIA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://brandcollect.com/shop/707/?utm_source=google&utm_medium=maps',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'AMORE Wardrobe & Archive',
  'Japan, 〒107-0061 Tokyo, Minato City, Kitaaoyama, 3-chōme−9−１ OMOTESANDO391',
  'Minato City',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7097347, 35.665119), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'AMORE Wardrobe & Archive — Designer/archival fashion retailer located in Minato.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2feTDJX2cZ3xzeiW5N7J32QrGT8lbCi-jHiwbwE6Db5AiLLHKArfvJ_2julxig6yITjlS7CFRZsiQnTWma7JPufzc7Pxg4tCx7CYL1zu6IeNOhOdd60EMCNWdZqOz0zoYRT4w34iESJFcbTtrmEqtglQUdwpgPgM2kzbtt5l8iKdQP-s6S-ZJH_X_hw8NX7BCaVJZG01TB6ZaCarM7ammdfHCE0lK73Z2OZkCm88D2OMsm_2LieQoJKtuZlyTSxMyeiPlLYOxQeVCUGFY6SpB2mBx5d2ljd2i4qzlhaKTo4PpKiXORHgxJ6k3RdXdx7jvhb85PK17FHVp51rDK78S3Q09GmVMsfl5oYikFRm6c-6uYIiPZ1uFC4BfRA9NcT3jP1ogZtW8kVMSl8J-t9fsIDhE1ZZUB93wpACjWehb-2fc5R&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://amorearchive.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'KIT VINTAGE',
  'Japan, 〒107-0062 Tokyo, Minato City, Minamiaoyama, 5-chōme−18−１０ コーポラス明石 201',
  'Minato City',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7137831, 35.6600292), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'KIT VINTAGE — Vintage and used clothing shop located in Minato. Info: @kit_vintage_tokyo, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fthbSDCM2ZV7RlY8soC3vHyM9klqAiodZ2h-1lotH5ztxVW3Q6pvWhr9Jt8o6387gXDdA2g_jH0rT0vgwg-aQ275igi2b7firbKdl4ETSjXonpYuvdzVXCJmxfbwM1WWq_sFddhJiwa__0MSG_VbAVYu2rF5d-iQfgEj8fy_VzsQ2BG6wFZTsCe1NUbFSQaMRamtWZSFtJPNNS2wsMDTfq0cS9vtK3MedptIAS9_bRJ7-zeWitZ5DatHbo9febZMeudWHHVdTIVQ80xI9SPr7B_mfLMTHuXBtTuhowAd0pRuWfyJSSIWY70EN-bQFfA6nWYEfRIhV3YroPmVw6L_i6MMAMfayKdmBCxesQFAYm6wjtxenXJBT9vlb0q3WJPEMgm1B5Nkb_ZkdP5mli1Dt7y2VkX5Le9aF5nTsLbR8&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/kit_vintage_tokyo?igshid=YmMyMTA2M2Y=',
  '@kit_vintage_tokyo',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'SMALL TRADES SHINYAKOZUKA シンヤコヅカ',
  'Japan, 〒107-0062 Tokyo, Minato City, Minamiaoyama, 4-chōme−26−２ morph南青山 3階',
  'Minato City',
  'Aoyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7188725, 35.6630727), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'SMALL TRADES SHINYAKOZUKA シンヤコヅカ — Fashion boutique / clothing store located in Minato.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e6LlRdYj6EhD9EMKqsS0I1ulwetKGuSdaFKS7BwGe1W3UZivD_O5U8zG-OR3bayNjrntYMzAMALiacSvO4DBDQGrPpWQANknP99pE_Ki9qj-55Wh7hzm1lbGLORJNeOo8ZU3eKcp17MJVFgiChwAuLUsAN0tFAE_tYVX8CdBEYxEvgR3OXm3jmkAn1qNcSvDAdcEKWKh6usiTqJph6driNrbjrMxFWFXjs4z81tlRwdm_k_agxuDbHQpKM0vsXamRz-xfZ66KSr1bko0TekLtfeGv-vRdn56tYlGFeMEQCXA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.shinyakozuka.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'yeah/イエー',
  'Japan, 〒180-0004 Tokyo, Musashino, Kichijōji Honchō, 2-chōme−14−２６ アゼリア 101',
  'Musashino',
  'Kichijoji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5777898, 35.7060627), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'yeah/イエー — Fashion boutique / clothing store located in 〒180-0004 Tokyo. Info: @yeahkichijoji, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dAUCVffChXh_3e4VLT2OuNuVL9FAN5fBycc58FdlBjvyD5MQ24biHU7klwpr80CKaFHGU3Oz-zXfwca3tyTYMk087VJzQFHQm6k1wCpf932k-5ke5FdtcIFe5o3YXXnN8DCL_oHq0EAav5_FgfFc5bVlChfaobAvletAHbsDPqrHIrdlfuO5LJuhiuw_EcMtUtesCk6E41qMP21bBP82BBWi80a1AqKXXNXDOkZD6zS0VcU1Bw3kedongf7gQ1uuCyR38y_fiOQC9QHkZY2lLluMzefFXcyGyC5qlXn4SOiQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/yeahkichijoji?utm_medium=copy_link',
  '@yeahkichijoji',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'TreFacStyle Kichijoji',
  '2-chōme-16-3 Kichijōji Minamichō, Musashino, Tokyo 180-0003, Japan',
  'Tokyo 180-0003',
  'Kichijoji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5846633, 35.7033823), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'TreFacStyle Kichijoji — Fashion boutique / clothing store located in Tokyo 180-0003.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fAODI-sRO9JuZRTZsgMAgNRECkXdQ_llep9vB-KEbFjFbOXjt-MdH5ZolSom-PmqvbFzfE6gjZzOKFHFHpVwFixTjoqzIUTuEXvhYNEmSiHTWpj27kPayi82bVXB7AhMghYka9TQ0stWMinJCrxpDrStwlioEObm6W4SkhGv6Q6XLSXjd8zYFHT2woNZJu-v39fZK3u-OnjaoYsMhhycV-MPunmeM71NXF9TgwAHuPZRDi5jhP3TjofnaLeflV-3sYmzqK8-kufQETTQtZ3iBsw7Hb39CBt41D5jHnmJ2cQg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.tf-style.com/shop/401/?utm_source=google&utm_medium=maps',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ADULT used&select',
  '1-chōme-38-5 Kichijōji Honchō, Musashino, Tokyo 180-0004, Japan',
  'Tokyo 180-0004',
  'Kichijoji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5871425, 35.7035751), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ADULT used&select — Vintage and used clothing shop located in Tokyo 180-0004. Info: @adultusedandselect, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dJLcj8_dByvhnxdZ5xxZX_kqBS0285KN5yp3VOAaYgyBVxDA2A8uSWobrbdK0GqWTVVmVuT8iI3xmg2zgDIZelRwOkamH6hNKUN59XFPkB55In8WPo-LGZZTqwvg_netdtFibvItT4LEGVISmbtT73zpnUjemCQ-52i5Zzc-kT8k2SSMG5JESthocPgd0ipB2Re3XU3-i1iIY2RJYZ7NEOwJsubXHTaMzjRDfB3qDnnYzolFjDxDl5okNXKUDSSmsbiViRdwYjUrqTqGLBbgonktfrDUKHmXvteg8jzYkAa4zcH-cVDHsi5kmgbgGTs1bQwExELysydxaMIU2wCWyO-x8kDFNLuGls4qX-RKmbkiaJcJws31fAAvUBbt6X9X55wdrH3tqFVIA7oXl8gP3PSvZ-03uRuT6t-qzLO7SgXNGEV8yh6jpIesK9VQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/adultusedandselect?utm_source=ig_profile_share&igshid=1ww0or0ikn3o4',
  '@adultusedandselect',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'N.VINTAGE',
  'Japan, 〒180-0004 Tokyo, Musashino, Kichijōji Honchō, 4-chōme−6−２ 秋元ビル',
  'Musashino',
  'Kichijoji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5734091, 35.7051659), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'N.VINTAGE — Vintage and used clothing shop located in 〒180-0004 Tokyo. Info: @_n_vintage_, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cvQ_KoA08QhDJcjlsYJxNkewAbuMQptelB4TB6R9GNpTkgsqZ39ql8a-CAdsF0Pi02fejb4pP23q-m0u-98GTsaz36TtgaNykcIyQhMFpA73JZnO6SBPDbHsXWUkiAGIm3PHDWYEoBRg7ZE2h5BEdpSxirQCewvSKnwFpmCJ4bX7VrxF9-aM-icF3o7I4OL4qStP3O8oSeW7claxlYcBNHF8elMLDDRqCvzghYl-EngoVCVWsIuWBb3aCRb28T9bekpf5f7m9AaQU68-zLOlxhIHc-_YEEw1VSFPMYZNee8Q&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/_n_vintage_?igsh=MTdqdHVvOGM5eG12Mg==',
  '@_n_vintage_',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Kindal Kichijoji second hand store',
  'Japan, 〒180-0004 Tokyo, Musashino, Kichijōji Honchō, 2-chōme−4−２ 暁マンション 205',
  'Musashino',
  'Kichijoji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5780956, 35.7056429), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Kindal Kichijoji second hand store — Vintage and used clothing shop located in 〒180-0004 Tokyo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ckvnHOVLglyzewPkNLwjJw7Msy44Zd-M0V3uEwic6HsDezaV7Kgzg35eN76GAUz5cYqmlvq3zWqMnIWIkIUTu21MSsPTdY93SwcqJlqDI-yhRe3x_a96l7pQElotoPXAk-Ut-2-_bc7w9gGwqR47Z63PIdnH5lw-Gu_Iox-Iu8SjM2F7na1q7reBDBw-cX4OR-6bYwfbFf7it1GFK5fCKNlMWNk0MS3W8VXkXsXwBl20TbApmJyQz92yJcL_AFVRXpLwKRfK183QvPcmFIm1ek2TpaqUcvU6Ehc27c3erj0QfnCX-uJxWuzHf9ZSgtIJKZ6dJUC13QB_ijv9mEdApjO8aZpQE1FXueipCS2LA5Jn_n8mcHqdQ9_bCnVYSbdNBGfakcxlwZw8qYRegvQ1Z-3DnCYiF7b9ytu0Cm4_YGJg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.kind.co.jp/kichijyoji/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Caliente Vintage Culture',
  'Japan, 〒180-0003 Tokyo, Musashino, Kichijōji Minamichō, 1-chōme−21−１ 井の頭パークサイドビル 1F',
  'Musashino',
  'Kichijoji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5783303, 35.7006124), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Caliente Vintage Culture — Vintage and used clothing shop located in 〒180-0003 Tokyo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dXhVLEZbO6GrvwNHe4FOLZUOz1pnJyBZLEDYyzNzJ-_BmViKnQhbKBSgn3FGmkmVX_EdQCoaTjuZAjRkA05hNC62PJ-GCS682LUksH3ynG1TaPZS31eQh88sSsuK2RnJxg-bL6DlZEmgTar8Hfot0C7LLWVoD6K6kaC0H-6SGJ5uHkdhmN-3cSirokdLUkX6DxXda48liunPNDBW-nZA1n-JbGQ5KM_oglG9q3wVECcXoBLFYlSG1yfRqU4SknnNzrt8Fx_i9Xx31BWTRDv5EmNeDeC8ZXi2NeaYT2mPl6VyuROdbKVjlTYUMLTl1_61iB2uH0-qQjymie9cCph_9HBfzM8uhg5mxYBgiPZgjxWDyqtdU_gndZkQ62GFmJI8nnWOwAwlvq0E0czJtYjidVKW773up0PWsASIQHdNVAWxQo&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'iti vintage clothing & humor',
  '1-chōme-15-3 Kichijōji Minamichō, Musashino, Tokyo 180-0003, Japan',
  'Tokyo 180-0003',
  'Kichijoji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5785534, 35.7015856), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'iti vintage clothing & humor — Vintage and used clothing shop located in Tokyo 180-0003. Info: @iti_vintage_humor, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eVyl_ntkOgL-gy_fhLG1X2VeDkhFvwJGEztD3kvNqOp8bQsrBVnaUV9uFLJy8WBnjOH30GV0bdqjdMALbA5RCra6Y9M36iAKVtt4UrAp-GaRfEAOpHJnnf3vyeFdFEcWaDcksEWbiMx4vmmRsp9O6_HwXPaDJAfKUrTZpAObEqgloCf5HjWJKXP5SHHGi_prQrcbMQNjh_eN_jet2amQLHnSGyzINVy47zAqCjiKzdFJGNyCm0df7j4nFgzpUOwfOf1lzqtJhevG04vd4rz2Nj81ORh3hquIpL_cuIrCPQWQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/iti_vintage_humor?igshid=YmMyMTA2M2Y=',
  '@iti_vintage_humor',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ensemble',
  '1-chōme-10-6 Kichijōji Minamichō, Musashino, Tokyo 180-0003, Japan',
  'Tokyo 180-0003',
  'Kichijoji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5779181, 35.701978), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ensemble — Fashion boutique / clothing store located in Tokyo 180-0003.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fxW1bPIODIOL8jRfxk0Rj3FYlZRdAfsc1mfSq1nFNS79tqLObRLMRRucj64IBI9EUszcLAeSB7YHDvLV-t-rm6ftm3RgVg1EQA6qEjJV5JDivZxgtynMvgcLXleEVm-WjEBQhzUiX9M5PzjYKwT9zaf4S2Wd73ox4bePRfDWy01C2a_MxruwEOcJm5RxJavO4W5QPot_YDLdq8MabHQAfi7dLDA3DbXOmfgKw4xk6f7aUdIQ1dsiR4wpBOJG8ZhVFLFsewiGDxtkMDdrfVgjAlYNKKOylDcwYO4mEO6X5FyLy8pN-lFxBNm8lPB6K1K_W74j3gQtd-UFMNGwo81QaIxWsghQmp237kFFJIT3VNk2Ki9Q3iqUYqJP9RHTqci-o_rovlDJ2PwxJXOS7sc5kvRnw2aXDIkCzpRn67Ozu0KmW7&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ETO select & vintage',
  '3-chōme-27-2 Kitazawa, Setagaya City, Tokyo 155-0031, Japan',
  'Tokyo 155-0031',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6679076, 35.664132), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ETO select & vintage — Vintage and used clothing shop located in Setagaya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eB56rwIJVpw7A-6LpV4iSLcaLl9Pp9DupYmnlPSIxDWN7MnzNc1xYdAYvcAa79ISQWL-7eJp2X-4s-zTlBiRSiDAxl8n-yFvF0OeLhwC2QidsmVG6e1sBYRPhGEyRbWvmAuYNhqcqy99JY8w2zwCqty7W-Z_Q4Ieyrz1MZXZeUVjkT81afX1h_-gIeRb46bIpi0haNU6G2kZEfxYLVLKbciQSt9oqIXYxI8Af4O74f2gkpycHioVe0SazyJwZVwJQI1cYWX_Aq3D9MIDtXw-SpOfWIbAFmMSbk_W27GYYhR6nvdAt_NFBYiHU0beZYHb2DpUw-FAcCQSUftVVnfQzg1ibI40krFItE3CP3nYvrnPVEd1PTdrVLdKJWoH2kZJj18o3JfTJ6X8SOE2GRnaAwfYWsE1sjAX7H8-uSxa1td4d5gI7ehg2ppatAmWRG&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://tokyoeto.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'FOLLIEE. 下北沢の古着屋と見せかけて池ノ上',
  '2-chōme-42-8 Daizawa, Setagaya City, Tokyo 155-0032, Japan',
  'Tokyo 155-0032',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6728835, 35.6596374), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'FOLLIEE. 下北沢の古着屋と見せかけて池ノ上 — Vintage and used clothing shop located in Setagaya. Info: @folliee_tokyo, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2foUIt7lc2KLrvkCCNWc9q5rXNiAF53h9Bf_l1C5KMRPdLhhHVRvGIK1Vi2GLjg2KpIj8avoceUg_z9Wb4mp8HiOtwZT3C-Vfwjo3e5FxG6Kgnfm-XZGg_ufaQRG0RhDp__6dcolmT5TsONTYO5Hx7r8jxM8PRX9BgCITY9ZJA24pbgdJMRjMTjvU1qnkuwzSjortajZqgdXjQd__i-Sw5gO2qoWjOMDuWTV8RJBfL1_52e6y7-HEHHJRDXbf1vLGAji5c7LVarO328RZn3L2G8hwTkOJnIOjYyIHNrGH4hrQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/folliee_tokyo?igshid=YmMyMTA2M2Y=',
  '@folliee_tokyo',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'mu',
  '2-chōme-5-30 Saitoyamabuki, Ibaraki, Osaka 567-0086, Japan',
  'Osaka 567-0086',
  'Setagaya City',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5213742, 34.8574291), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'La Mu Saito — Fashion boutique / clothing store located in Osaka.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cUj8X9MHSVEwaJtV5_SSsPFJjKnhMTnHBhlQPxdUVBcokejHzxrdfgDN2tl-_GRegK2btEosS4W2NxS1GRcPGrnxg982waGu_CQsupQ64qgkPwolWuEp-vqsdCwo2R3yG7jHEGC1DuAm_sBMCoNfvXPPD4lsk63bB2d2igm39hjoLvT00mjGFtsZy2IXM5M0coG8HbfIxP9rWgVdLzfIj3oQ_b8klWi36BoOuGYuXH8mkohSBD6q_MS8F2webu4bcYnG7-6dKC3OLdlFd6nJOafkYNShfWcN6Ejdvi-U_c3b2vSSfh-1CiQBFX1NbB3xevajVqCYza7R6PDjUCoMeAESW9EPDDRrO47uG3FVKG0gLz-mIYrS5C-c88PpPkscr1tMfGeyMkBMZO_Sa-hyGxdu6Ak4sI91Lg_xAEbBZv4fuUKKmyBsMp75mfCcJB&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.dkt-s.com/map.html?id=378',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'MONK',
  '147 Jōdoji Shimominamidachō, Sakyo Ward, Kyoto, 606-8404, Japan',
  'Kyoto',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.795749, 35.0231576), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Monk — Fashion boutique / clothing store located in Kyoto.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ejXSrTq6P5gFEalJQAFf-2OhVvDPIva-XtMsWZlReWy2m5PwG8GvvDivDtmqQIAVIpb1-NTHh6NWVErL2Nrn-mbeHDdiiTlvOJB79_H4CdouJj1cIkkIu2hp3XFfipxQt2_xUpL1Jpfj9SEpxlcpsnN8rwyBuTtGKZ40HdG5SnPAHjdJUVIIwdFuWJyG0lqH-52Dvm2GKCr3F4QY6PdBo-8xRpyvjAo9d64QosdaBJC_RxyWfvjSDmhtyrHqZwizshTmDj8UaBohAwdGj4joNtyrHFwnIMvjsyA3jkZX-MHvOab4s9S9dsKMSFZdFj_l22ZK5MUyxNhCxg_tB7LvImhM3eI4qVn2UWoYTynyEzyUvmkrfauhzcQJatzS8Fr7xDLfU0Isq7H947rEPxgEWkZH78cOwxnMPKIETOruBVOJQX&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://restaurant-monk.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'per-aah',
  'Japan, 〒154-0004 Tokyo, Setagaya City, Taishidō, 3-chōme−25−６ サンオービル1f',
  'Setagaya City',
  'Setagaya City',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6674732, 35.6506731), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'per-aah — Fashion boutique / clothing store located in Setagaya. Info: @___per_aah___, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fAoDooriq9Y8ZhjWoD7mv2tOSzCfw6nIoIEjIPBj8gF_Mlqr-Thgx_J2LQl5Ru9d3S6u9wi6UOyLwGGgKcf4rFC-7DNrdaeaU_XBQeKqy7Lg-Xsc7YhzV3Hq_Pa2vbcHyebLi7u3UD4uRZU1Ak_vJLTnEMnWVVwmVC7vtq3J6ZrVDmEBNMhvBwWAiFzrVPcZ1QUdjVywx6mTeb9XbRjXDq5hcvCV9hoymfRQIEDD1ZpXBBIykxfstg9hIDVSJgyRUYdtPjSfWLvmIvQg1KosqIGwpXtzpikzP5FUfnyNjVxv95C_Z3G_dRqdIUY5USp6S7hItDIWN1yXKEOVlkt1r0VrUT14hLZ8kOEvasqOUHIzQH5UwmhPrYlucLMFVQodvpl2MC5P70XpzQRy3kMbsS7gl3xW4y4eTgRO27fT8LaJo&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/___per_aah___',
  '@___per_aah___',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'AWASE',
  'Awase, Okinawa, 904-2172, Japan',
  '904-2172',
  'Yoyogi',
  'Japan',
  ST_SetSRID(ST_MakePoint(127.8326572, 26.3188891), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Awase — Fashion boutique / clothing store located in Awase.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2d6iLslE6m2ZQY6rPlezQ3wzriJ1E_vabGFkLwN34NghBNIAg1D4cL3BGNGwNV4k3_tT5PVlW4pFCPWiS-xgDwyuVI9XF0RU544uCbN1gvRrZAHML2-dbGMsKT5xvPCbjKN9BHJyiVjzY1U-KLVAKA2RvGr2TTehcnJ4Yqf8tl4EaEH-QpAV5ySS5-b_VsZECbUiyCRccJu3_qKg8c6dcKmRRYKlAIKX2ibyIe8U8VE3QtxGessewnZ1m5sYkwU2Sl0Cf6cXWnHALxJOX9IDd7uWd8U5yNJGODFry1IMuOrrFTCukakcDkmu50tb7btP-PgAKNQqjTzf1GEJCMkNxoSh2DNzX0TPNKrcuZ7ZeXf_1TVCaF_m4wbOjoSnPcdi-L1vst2YYnmahddzBccF15icuH3SuE9j7obh9rVC51oGd6-&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'wan vintage',
  'Japan, 〒151-0063 Tokyo, Shibuya, Tomigaya, 1-chōme−44−８ 高橋ビル ５０１',
  'Shibuya',
  'Yoyogi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6904794, 35.6677411), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'wan vintage — Vintage and used clothing shop located in Shibuya. Info: @wan__vintage, website.',
  ARRAY[]::TEXT[],
  'https://instagram.com/wan__vintage?igshid=MmIzYWVlNDQ5Yg==',
  '@wan__vintage',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ayahuasca_clothes',
  'Japan, 〒151-0063 Tokyo, Shibuya, Tomigaya, 1-chōme−51−２ デュオパークビル MサイドB1F',
  'Shibuya',
  'Yoyogi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6893524, 35.6688003), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ayahuasca_clothes — Fashion boutique / clothing store located in Shibuya. Info: @ayahuasca_clothes, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fHA87op7glebqAMjrGK2eLAwMlocUp8r0F3-wrCxxcgt3HM9KBqwgIoA_XoegkzAzucVXh8aZFfZAOH0eWEH5goeva-xnBEwF6kSJMdJWvv4VQwZ68mflU-Oxgd1fHQmS8BmtW62AgI0x-8eqpUcYN8DjsiywRzTNNc9OK-4hrIcbZxUdK_k6mbKb_ltN3XuL4e6gFDxlVdskqJX89Iuc1Tor8nt3AMa-8Vq1XCqYjnZf0XW4GoGCJUSZuHJjyDg-aTYwM6s6WFTutx99hJdhIOxo6zcPxfJccIYwfpYN8jg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/ayahuasca_clothes/',
  '@ayahuasca_clothes',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Tanagocolotus Kobe',
  'Japan, 〒650-0023 Hyogo, Kobe, Chuo Ward, Sakaemachidōri, 2-chōme−1−３ 謙昌ビル 403号',
  'Kobe',
  'Kobe',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.187933, 34.68681), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Tanagocolotus Kobe — Fashion boutique / clothing store located in Chuo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e5Gp5ACqUb9MVVCmYgj3gOdmtk_d1eNimEDFu9ngcu9AqRUo0s_ezkZwyDsRNgPI8xl_1RWlZkoJmmtLIfIqv3Gm8hUua8u0rikr3ldVClW5wsihhR4e_CeildQXuZglsdbPd_IuK9_oolhXQJmhwypP4UNk0fLPem1r8LiOSI9Vh52zjR4SSXEhO-FRlEJcw8b5UIcQn6gTITfxdb9NIPT-skxQfT9qx4ARl9ej68GkvM7LVwxRcdVmy6yXmBAZwiH5J0EsG9GSEQlX53z01xs-sSuggAFqjY_Vb8xNeAUg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://tanagocolo.fashionstore.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'PUKUI',
  'Japan, 〒650-0022 Hyogo, Kobe, Chuo Ward, Motomachidōri, 1-chōme−12−７ 3F',
  'Kobe',
  'Kobe',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.1885513, 34.6892996), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'PUKUI — Fashion boutique / clothing store located in Chuo. Info: @store_pukui, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f6VaN-JKfENWFo_uDDW75BCQzFbSHHgJiU8ajfHqj3StOcstVVTMelfDibx5PQ-CQFCYz0aEMmn5ToWwxx2YzR1uBhmIssrzbFpuT_n5mqvFCsyFdDXrUwdd1C8fAxGVqQgfinBvawJUpKqjRpvI6SH8pMXO4B8WVPqyuz0mjLuh-YDkXhKSCj9xX9iNnlt29X_mE0SLqJH1S1vqwOcQY-_x2LS2LUCL9vJqtcJyPpRPXQay2tbkwLxNH5jfUiUu9MkAtyvQi9r3ZIzKA39H2wdAOhql1iaeuUjJqLcvICbQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/store_pukui?igshid=1ue5s7bs6t8gl',
  '@store_pukui',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'UZU',
  '146 Umenokichō, Nakagyo Ward, Kyoto, 604-0905, Japan',
  'Kyoto',
  'Gakugei-Daigaku',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7681188, 35.0146643), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Vegan Ramen UZU Kyoto — Fashion boutique / clothing store located in Kyoto.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fAa9NQ4RKjW9DI8T-dpFQC2QSE8701-CKx4p_vK4JoKqRSPWTEHwZSx0b-lLVlHT1QYwyMKbKNfHYqclbwQ7xORjgRuN-MxaSCzfw1zvHTSElJJqS3T5Ko3FDG9BqtDkgt36FuurTUW4-SZ3jzxzdlaC6AT1rFtVb-7IPeBNBXP-vPUvEze6DUk1U7a4ejACmksEXLe4ZWswLJ8EDuDLyZrA6srPoMHKEAZ3ll-4Re9t_kGAXSCH-92LlM19kYICK51XqPvyzI3CMeSBbat66iBTQloNiOPwRCvlprtYQcXQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://vegan-uzu.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'entrance [Gabber]',
  'Japan, 〒166-0003 Tokyo, Suginami City, Kōenjiminami, 4-chōme−27−１０ タイガーデン 5F',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.649884, 35.70473), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'entrance [Gabber] — Fashion boutique / clothing store located in Suginami. Info: @entrance_gabber, website.',
  ARRAY[]::TEXT[],
  'https://www.instagram.com/entrance_gabber/',
  '@entrance_gabber',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'STAGE',
  'Japan, 〒538-0053 Osaka, Tsurumi Ward, Tsurumi, 3-chōme−5−１２ 尾本ビル 2F',
  'Tsurumi Ward',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.560899, 34.701927), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'STAGE今福鶴見 — Fashion boutique / clothing store located in Osaka.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eqr0toQMDGgkwAkA2L48Y4Sn9HDvUbNN3zvXy4YuNcz2Dm9RxEbtfV7CTbtPth_h009pqKCP1QvVmSnqv1UbxjC8ptKVW-ti4cwtgbtCNjNdM2nEdkFDaHEVsojauJViKFMnbPb0pcCQZOuIdy3agz3VQx5rB3cP87XAsYQ2ISc7TRiY6CBboeZLvT_dA2DRqTwuHZ8qwbAQu66ABY08BSCcV8bwr0jr2W9Sx4ee9ssL8hocJhNKfcTX2qS1qLgZrRtbOvzLqy_oNE_Dq0oGzfCERZ1_1SxVPZuhiVXyRAmA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://beauty.hotpepper.jp/slnH000192991/?vos=evhpbpy0003&amp;&utm_source=yahoo&utm_medium=cpc&utm_campaign=%E7%BE%8E%E5%AE%B9_%E3%82%B5%E3%83%AD%E3%83%B3_DSA&utm_term=&pog=mt(b)ti(dsa-420234326558)dv(c)cr(312110402633)fi(39071472775)gi(52385962957)ci(1073902291)nw(s)',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'THE CUT UP',
  '2-chōme-9-8 Takaban, Meguro City, Tokyo 152-0004, Japan',
  'Tokyo 152-0004',
  'Gakugei-Daigaku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6881421, 35.628925), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'THE CUT UP — Fashion boutique / clothing store located in Meguro. Info: @the.cut_up, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dSR571t5uinnik29dCTDeuztxunFnPw5ctsxuaYxVRsuCYDynT4eNjt1TTl_qiRO5J-hZ5nd6m8Xm05FH6_J4hbvX-rp2XlTG8mSUZv-tiapbVLBl5nyQPfQhM3t6ghbdoUDa1y6lB2Mf1KTCdsbzV64vGsF1ssQ_ULKPznYmYlhuesF-dEeX00MCiLbyllDwFbY0FlDfJ4JXloe8eZXfeLRuf2bySzXa6DFkZ7af9-i61x9o7LuNSTGGL0UG8u18sWio3Nyio1j_cTTwDsBJTll-DzQpDWlgA5BxqCJs&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/the.cut_up/',
  '@the.cut_up',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'AnchoR vintage',
  '4-chōme-161 Motomachi, Naka Ward, Yokohama, Kanagawa 231-0861, Japan',
  'Yokohama',
  'Yokohama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6473443, 35.4394549), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'AnchoR vintage — Vintage and used clothing shop located in Yokohama.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e9yglHhjiQYjHisF5axxVWbMyvPMMHEDb9w8nFZCNpaei-ytS6hncQYXydhmYzqYPWBhqLBCUKJyoYvhufNZNl3ehjgcqTAOq-VET7mcxBNGW_zCo36hSqhtWkLa3PgtXgpyWWsHwMZVPVzfLn-6wXRvNAhTxJ-dIG6kDhT79da3ViINf1DTbzQ8U45bu1D0qXNRIl88_97NsIJD9Y7xMiM7TykILw0tASJD1tIopZPngi76AhYjKqreTMWP2YP4ngx0DMD717_uTCux3HZuuMPjeEwT8gATPxaXXz1yk2AQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://ameblo.jp/anchor-vintage/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'British wax-jacket market ZUSHI headquarters',
  '3-chōme-1-5 Sakurayama, Zushi, Kanagawa 249-0005, Japan',
  'Kanagawa 249-0005',
  'Yokohama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5924578, 35.2967369), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'British wax-jacket market ZUSHI headquarters — Fashion boutique / clothing store located in Kanagawa.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2egzzDW1v6n4F1SV9uwztYKoFiYt4mBGkQ7c5gyae2w-K5oi9l1iGyAy_Y-F7TvrEvv5uIb-tNNOEUfSVVCfZXXY9eNw-kctiRlreNmrSOwsx8IcdmAW10dD73R4VsHiCGgYkN1LutkTmee1FUO-VE2-gSfvvFW_sWU4PVWpvLmAO2WmaqvcinMngDsvzFqWEYSAblT3keHQ2_fvFBSFhctjGnVo40sr-RY3YnCAvwU3a75S80DqsxLj4IrNTSUhU6Ap3csZ5zLHRHqtAGylqe-t-qPJOkKV7r63tIVZ7aF2l2dXvjkcKDi4GQcmF1TGnlQulnEA92JzxZ83juvlJYo1vEwK0rOT__4pFIw6CJHxnsOlkEyyn-XWLCXYm1e_EW0OQQgZY7T6xL0BREvqgVuWpVEdUcWKN5cofzOdH1PYIjK&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://britishwaxjacketmarket.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'recollection vintage',
  'Japan, 〒860-0845 Kumamoto, Chuo Ward, Kamitōrichō, 10 10-20 2F',
  'Chuo Ward',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(130.7124408, 32.8057734), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'recollection vintage — Vintage and used clothing shop located in Chuo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fz344dJFu-wZw68ygqJ9QMvPUKNqfn-Or-O13ibrIZO_0iOckDl34Pk1bv-O-SPe0f4cSLLemYuYDkjJ-DIaerGynv_b3_Rv45Bqgs_l2Mwk_OR2zI09YkqaSjEwRWpMfXo4CaJmBDnfd_UQuMzoNsR2Lw9Vr0x3S1gqKSel1k_PXLWAk9izjeSITvp_bnqcHWbMTg3VgmRcetIGbKP98GpnsQfGSVUAll5wgKdkDMf4nd5jmBRgtb-Vu69haNazS3qJKrjBY01Bawt2gmPwuktsu6Cf0PgfS4Nd76t71AJNCOVJ1CMt1J5qFvL1EIqN4JpQGUTYMKgvwPlRebIM-sCj3Vc92dWGJ2fKDDO0XemlQROhCvc641LJedIaTz65KLrtmXf7EVeWu4EE_feW6j5JaOwyNXHok62rcHeO214VqW&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://recollevin.base.shop/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Mr. Clean',
  'Japan, 〒151-0063 Tokyo, Shibuya, Tomigaya, 1-chōme−35−４ セトルＭＳ代々木公園 1F',
  'Shibuya',
  'Yoyogi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6891233, 35.6673754), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Mr. Clean — Vintage and used clothing shop located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cG30mVQepfuRYLWLMfW0rpvF-e6PKM8vQImM4qKXCEQ_No4kRrJzq1cBuu9xARDmKAAWqG05yOv1e7j0idoQ4ZUBqPXYkuUs-yOmd_L0oM6ea6F1jWb-vjOicwreBjKqqDHuohHeg036BeG9J0wVC8EJmaYKwif3TUDjLxx9FTVKzvHPnFNURuSbfMxYDRihpbG_cqCzNE6UZwm-lviCR1RGQqS7gwpIW6v-c7EzOxaborvUDRslQr9Qv9JWWVdyIgKETszobxu3My5m4IFJp3R_9rO_v3UH0cdHbMVsaP46dMrED5QyHtZMMPB38LkOaGxTdLPwQBhY4hyYROJWL58CSFrTv9yP5_BmzbF3lwc1CukxMb7iIrtc-0yGHv5yvBIx2ZBvmt6OQQ0jP4Ynx2qVC57NP5UQwc8Vw5FpeY9vef&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://kurikurivintage.shop-pro.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Esmeralda Serviced Department エスメラルダサービスドデパートメント',
  'Japan, 〒151-0063 Tokyo, Shibuya, Tomigaya, 1-chōme−37−２ 代々木松久ハイツ 1F',
  'Shibuya',
  'Yoyogi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6898606, 35.6673989), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Esmeralda Serviced Department エスメラルダサービスドデパートメント — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cMubafzQ4etcnJWZu7bZjV9T9pMmnSIjIWTrygCWryFbLBpKBlKBvXwZOIdbiggnxXd0E9q528Vpt1_PSjNjTbFP2hCkSD745ICF7H5kiQOoFlpK03n2dSpUDmxRCk8kKyT_hdvlzp9Kk9Fl8GaNnI2R0s-a_6Olh30WSGv-b1Y-iJyUyYIdjzd7djDLhBlPYdESMh62w0CMH7pD5XuS_W0oCVFDgKHcTWVBC1hXJ2nUzM0yHe2kPl8twZocMV3wU6u_BHKDt93Gd1twU08jckqjlf7YMjhG5y6u483Xf4Q3rBfAnP_ncjEUa-bcc5M0s4RUOx2jOM8mghKCTgAZDdcv2il83FmlRd59KSep4sl5H3ed8nH56mHtuRxlGgEUsnkqptbYZbKePtkD27o4NGvaKjTpLCbWTzRPH9BNjHIoI66YS6R751obW1ISwR&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.esdepartment.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '2nd STREET Jiyūgaoka',
  '2-chōme-10-3 Jiyūgaoka, Meguro City, Tokyo 152-0035, Japan',
  'Tokyo 152-0035',
  'Jiyugaoka',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.668174, 35.6083806), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '2nd STREET Jiyūgaoka Shop — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ctwxZRuK7KxcnmccyKAZrffSGRNMC0G6uK4myOnAMchjN34l8jHZJ3SiCjOeOeRI1ze2f8-hf10IA5H0NHzVI0MdiKYo4-OUKMIYnObeuQsZ0jZTNKwD-8JG_FMzd3JkLqBKpwlGqmW7vMEkld_NoIxjtyrwYwSnkJA1HEY6Da_7E15DiiFdsFzf1HJgmLkn5LFBe3cJPpEyCS7CEZT56J3fJkxrPFoJjeCBlzmvwPkxr-TboP9V6jQXEYNZckyUV7dYG2eO-u8U9TS7uj_XMxOT-GYuOmFnfV2WcMnk0a3tkCfxsNFWUYDZtmsk2b-jeXdigG7K0J8PSUJBsBz2KwTtcdUESEmGFK4kTWdVIV7xsCIsaCzb2i42ahvhKHE7cObvVKVSJZlduh_nVwkXyxJblXCQL54BkuC-azPjjM-g&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.2ndstreet.jp/shop/details?shopsId=31108',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'BINGO 自由が丘店',
  '2-chōme-6-19 Midorigaoka, Meguro City, Tokyo 152-0034, Japan',
  'Tokyo 152-0034',
  'Jiyugaoka',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6748883, 35.6087522), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'BINGO 自由が丘店 — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c88CbDl-EiNcPSXhZC2TKH9aEcTVKHBEPpKobIjE3HliSFAMmzbuDpT1mAPGxoe3XJWo54iHxNS7rXplv2ZNlXBHUfYN7QVBUmVuOz-JzfoglGQf6w6Ktx525cRLqp0V0zScyseezHgXi80jSm_jRu1ZEY7G_ZcMqeYROldvM7eViGqHv0M6GAW57NymZtEGc8a6xlzgFZNbMWg2B_F6l8PGysPP-No2XNjcwM16BVjzqaMJTXk8gsgWLV2dJM-whBNSEF6XM1OLbZVfG_uuyJPl7PHL_Sh1ihIc373138Cg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.bookoff.co.jp/shop/shop87001.html',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'FRONT11201 本店',
  'Japan, 〒151-0062 Tokyo, Shibuya, Motoyoyogichō, 4−５ CREATEUR 1F, B1F',
  'Shibuya',
  'Yoyogi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6874483, 35.6696777), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'FRONT11201 本店 — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cKFwI8eD3bA27o8PkcThC_8WbVj5wVUbvCP7RTZQjZm1rQIBD1vFtiiJyag-WbpGjtpxojQwmiuTIgmR8nw441aW7RcDHw0zq5JArHJUCI1QTsdJnrfAitlM90QpYCs51f9OfVAyvjzIA6xXYVNFU6RPsOSo8d7BYyQOn9hSGqIvspo9r2I-Hg-2d_giEWFhuKT12Ma5tq6mJBXWnjmOYuuPQUL_Z0qo4Q86TaU08HbrGaANXs1FRwpS6nX68c-KSAjmzaZPTwDnb8dQKaLHL0Ueuy9CZOVcLAhdhMdaXClQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://front11201.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'fini Asagi Antiques',
  '3-chōme-37-11 Nishihara, Shibuya, Tokyo 151-0066, Japan',
  'Tokyo 151-0066',
  'Yoyogi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6798596, 35.6708886), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'fini Asagi Antiques — Fashion boutique / clothing store located in Shibuya. Info: @fini___asagi_antiques, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2enBd0U7ZkoDe7nMqoA8_AtXaDXXd5scpgosnJwN5W7YjjJkfBFOMA_q8pF9qJ6Ms0ocu2V9yhYLzHsY4-x9C5ogRj05czpR3bWLxDyAJGbwghMP7dG_lUb8VAzb-gBe-k7AzoQXJvlD2LBJ9BFyDLHLj3JYxXjMCQjmg_exT-4FYcOeXBAPv5mJ3MEUPXzk6_UrCyNPKozdnk-PmuzUwJzdPBi8_u_Sn3P1JghFZF7fgfxEVmEIh6W6Uoi0axUgL2LL7DW5npG47JV-3CGgjPHDDHaj4tKnNK8IIVfwk4-1g&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/fini___asagi_antiques?igshid=NTc4MTIwNjQ2YQ==',
  '@fini___asagi_antiques',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Graphio',
  'Japan, 〒151-0064 Tokyo, Shibuya, Uehara, 2-chōme−32−７ ナズ渋谷ウエストレックス 401号',
  'Shibuya',
  'Yoyogi',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6784501, 35.6642456), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Graphio — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e6gBGHSrNstuA94cqYSuOWI1qSoqaeI7YWf7aLps3LfZHRXJu1MddHpS5D5c7E_xWxyQQhwkdUhT6Qx5IeiFHRbXDTl0KbO7USSYOEzZHJ755YP84JL6tYSVyZUP9VTmXMol8Hua49goSjMIrvNHduEvHSTygPYxYrnPFGT0FjSaYHWZtNpwAnYUZ5ESRg_Wj2m4XQt-DxZD3yFUk1Il5999HZmTrshrjV2Bef6egl2U1375GlxaXp1UNz7uJ5uDfrneZQmH2clCxcmEJeJ1OYw8dAINJa0twVwsKnWQqxmOtXxPn-g5UqY6VNiTqVHMpLI0htqvIbQ8V_JqUdLpqMQ2IN6DXi5YczHlS-b_WwGi03CKPJT5XMVb8eAcMyqdixmtEbGVR4f-uz07UMWvXJISfmCpyi126-dkVJplsqGxBJ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://graphio-buro.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'STRANGER',
  'Japan, 〒130-0024 Tokyo, Sumida City, Kikukawa, 3-chōme−7−１ 1F',
  'Sumida City',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.8062939, 35.6880473), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Stranger Cafe — Fashion boutique / clothing store located',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fDHLWpVQ3a2g9-loaPQzzszBizqK_S6-cdpKp3HQZRokhu98HQQygaXpvE5NPxoUTL3W1Tabd4EAo0TbtlZJixfnHh5QxAAHwHisKpWg8JuAk4iZorn3gJVrXsWjk3DWQLdF0dscCNHdc_tkbXRvIML1ejpruTjPZ87s9XKxaKgtoAzaMQVLwMi6A0brl49nhVxKqITIAUcVSSaIC--neFnRU4SLJ4ZpIC3RYUGfsc2yFzi8qtomY8kAIwxZSVLqO6DRq6LfQ7cUvlYFfyU6vnQZA702jUJdP89HjFGv8mPA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://stranger.jp/theater/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ARCD',
  'Japan, 〒152-0035 Tokyo, Meguro City, Jiyūgaoka, 1-chōme−14−１ 2F',
  'Meguro City',
  'Jiyugaoka',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6701299, 35.6096723), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ARCD (ARCaDe/アーケード) — Curated select shop located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fHGJuJKXeP1b0Nrag3eBnAeo-MLGz0oBlikKyb9PZ_ujN62U8aCLU7ElMDOnxocR0Od74ABAI5m3SyfqFtJGmfuvzSZztFsVReU-bosZgzFn2dghjEhQVd3HYDWzzNFqB6cgF3M2pYTTRq4wlIz9rIs1WED5ElhuPun2Pr7AMcdR-Q_i_rSW65nnTWTMQueBIHnhs3LXCBHB5Z07y7n1Tdx5BVPU7x1vfQt3iq2j7mWwZYxTlCv8zc3WAxLXPUUhmpFiej1r2k7L6zDF6xC2-uXg4eTZS5t2OTEudbtp1Fx8G8TJWHk1C0RcLGosmN59d5FlhqQCfspcKjL6JQfx8Eebq_G6zzKmHI6XjYr5hWiamGrn1zkwUBGoTNfQLdeAzr5rS_rCcqEUPNvlaahXpyJxQlNji7-SXxdhjXn9tFnQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://alal.shopselect.net/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'yorp',
  'Japan, 〒153-0042 Tokyo, Meguro City, Aobadai, 1-chōme−27−１２ 朝日屋ビル 3F',
  'Meguro City',
  'Nakameguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6942676, 35.6478053), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'yorp — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eZc7sT-2cS1GKeyHQA36oet2yyGsbvk7ntpGEcciRFNYeHXcplmYgM5FzQPG-gireBysF1A1lJ6VI7ayQnXoD0vgKT2MoSoofR45Z1_vh7080hBiJ-f7wtWbAUByCTH4AVttyfl8UlW_-fUJ5SPlFnVRaVr58Bxlf4KkyBMI40h0RCZ4Lp_hfBz19fF65U_OalkGfrtUBkNHFH8lH0_og1nb4MzoBR-wRRk_ZeXSXCovGGUhdDxdP-Wne_6F1q8QigDktgpQOUgIkVYNNMygMwcylykC9hImv31kZvCGs-IsupaG23vj-eZsPY62cZP-EQbp2gTGq8XMhxblwlWLJU97NiA4c4c2zvxdwRqaaUrzvJciWrJ-cr4DwAkKGe9z8gYUNZjX7JZMchhBwKFbVaCeHADgL3MX0-bFXMBj57LV-s&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'DROP',
  '2-chōme-4-4 Nunohashi, Chūō-ku, Hamamatsu, Shizuoka 432-8012, Japan',
  'Hamamatsu',
  'Nakameguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(137.7142752, 34.7209883), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Drop — Fashion boutique / clothing store located in Chūō. Info: @cafe.drop, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eGdGu1Fx7o2cdwL2VL6-UgsALrFKZqAjMbUDL89CavgjH20_nzE3NJhh1yk2xaV6iIopAsoyDduBGuXe3oka6ISs5DFiP3vUK1q4gDD-TVy_S3hR5Lvy63x9Te60iNOByyDxIuFxUGblYT5U6zImUgxkxt2qK8VFgr2phDw6_W98ZrhghqinLg9jT1syD7UEiDvPcbT28JXNcjxV2sulJtMLydiQFTi6VmwVXFrfEtbCjBvWJHy0wt3p2VJjribLMQqDr8GuLSiwYDv6wDDvyMylghvKlvTvxtie_rPWvsPC44-2pB2R1lrwmNvesdwXdL7dzm2jlclyBS1yNmtbSq8-fmnrz2AOx7HK0mrWTmd0CVr1eUnuHKd1G98WfJwCQG6VOAb2dps74ArzFhxEqaa01lZ4HquhbBV8zNXuo&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/cafe.drop/',
  '@cafe.drop',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'THREE',
  '1-chōme-7-1 Shinmachi, Aomori, 030-0801, Japan',
  '030-0801',
  'Sangenjaya',
  'Japan',
  ST_SetSRID(ST_MakePoint(140.7376048, 40.8259204), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'THREE — Fashion boutique / clothing store located in 1-chōme-7-1 Shinmachi.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eknONm6wQo7ncFFcDUWKQ-N11KjP4DqMyIOcQswzlzoYuE_9x1I1GNZLicLFzmoRk9bXq1QVER542LLbqUKuhwYj-DApTWGI1mx-pRGSPXhTvbOxPDL90UcFtM11TewEuc1bIofGswENPw3S9PIO7MUMa-unAnVtxpQ3OP92O1i4Docbf1Bm_kcC63cuhMhnj58MTHWJYxxa4AzGTM6reifPGy7m0rmc5auRPc0kDZ74-fcZ09uF3aHtzF70oVg7xdcpCJGSK6tJNiYRfucsSJL7rvefnLHlDZ1YFgHyQVOLQT2tdSUfapBij_hSTaW-kn9FxYNrlfEZV6ctUnwOv8hsjesgytvLtyxZ7JWe_Kc8B5C8yyn8V7ylj3rbhLxm9mvft3EoFdTueA16Xs78VeNvDT9CnrMqWd_XNDRTw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.three-aomori.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'PULP VINTAGE',
  'Japan, 〒154-0004 Tokyo, Setagaya City, Taishidō, 3-chōme−22−１０ 前田ビル',
  'Setagaya City',
  'Sangenjaya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6681962, 35.6491606), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'PULP VINTAGE — Vintage and used clothing shop located in Setagaya. Info: @pulpvintage_tokyo, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eP0oCSNEGdvuPXxhbF5Yj_36uK0Z2bVGMPeSxHbPD9SD_h2kH7FJDRBacAcQXqq_QYlbDCIh_Q2iRBH95Z-o962UfdGJqCi1qimApu26m-lOEORZnan0ogiOBZVpE2t-S44C5Q4j4GmXtYSzwRb6ASF177btfsUASkFuNMVDtx0jRu5HfUWbMK4ZyRuKYu2EdYCAqTHrY00y1f5ggzEnvnitL3jZqeODnS3hbTl68AoR2VBKXLynbtKKbzt_QacUqnqnEgV4QH1hU_BpmPK_9EtCk-LVY2C4xe7fed_BPYazWVInxmuJDRG1j2pkNOCC20KRnl6t6hyUZtGynBZdY4UQQPG5NZ3a2KCMRixkz1JgsI2Px0HQCN_pBVJM1zJtl24DB0bvfZOQuNqeO6IG0HIcslAdUl5DJU8u1Qz4_c0XY&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/pulpvintage_tokyo?igshid=YmMyMTA2M2Y=',
  '@pulpvintage_tokyo',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'sui vintage',
  'Japan, 〒154-0024 Tokyo, Setagaya City, Sangenjaya, 1-chōme−36−３ 三軒茶屋第２オリンピックマンション',
  'Setagaya City',
  'Sangenjaya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6714212, 35.6423848), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'sui vintage — Vintage and used clothing shop located in Setagaya. Info: @sui_vintage, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ePYzh7ILMjlXQW2BemerYw_hM0Xk7fZre10PvbGkKB-k06tUdrLEQlCClfBwUo1nW2AFnQxok16SN1OB8gn8ziJgFnKagrOBdOJ7ksszi41LSQlO_58X2zC2GHwtVIrVzyzzRxEVcj7lcHAyuTelIYmbnlkgmfP0svEbWSgVvLuOTDK0wPfVVT-7A5Bg0eqxQsHAUDYcktYsmIMHZ1IZiaWVGuZCXjqx7RX3x6JOalD8m6a7lhHvwPrJ8AyEuvrOUswDmMVxvUe3c-rJ0Lgt7cIi86gyWWCEktDFlYXHQ6jCmwm0rnQdD5roWNLkbEJfVrvImcXYhKDziHatZnn1dNq-TtAZpnT4zI-H_E41X-XpMRk0uTM1InjQ9CICS6tPUMbr0R7C-f-d1iu_YqEg48-Fr-xHPPd1nNDboOiYqqsj0d&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/sui_vintage?igshid=1k0tvqhwfgt6s',
  '@sui_vintage',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'BYRE',
  '3-chōme-53-3 Fuda, Chofu, Tokyo 182-0024, Japan',
  'Tokyo 182-0024',
  'Chofu',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5504735, 35.6473333), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'BYRE — Fashion boutique / clothing store located in Tokyo 182-0024.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fBH62vhtlw1DxcL-aH0FIDb8ahAlBF0edl3sV8cHzyRgwh7iVN2zQZ9WpfxiKwB8yJ7mEIOSLv8ozE-SQrF2b0SFVPqO-Y3wAYsJAn2EmkCplPpqZ4FnS5RoLAGmSWOw7WxIVW77CAMnCRUc-6zAZAygdQ2wCbuAJsDCId6fF3dPcnzI_aFewFhEpUV6f1b2z6yEcu3R7G6g5mqkvnxdrwruGAW38AJ1ykM_EzYDEmxQHi5xSZd2BwhROhKWJJz4MU5KskXYiXT0vIbfREkPuMDEJ48L7G7Ee70utNzdhZ-v7em7auGQsEt6M27UmSuJpjU00z8BKebt1NRSUjNbfp3r4OSGcn-u89IpVItJjYBk5krF5GJr0sNyJPpOBvb-gPGDjWS0azTLrLP_BiQeBQWirGU-RVNtaq9ZvuAtqC0Yc4&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://byre-chofu.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'American Graffiti',
  '236 Yamazakichō, Nakagyo Ward, Kyoto, 604-8032, Japan',
  'Kyoto',
  'Komae',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7698064, 35.0075611), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'アメリカングラフィティーズ — Fashion boutique / clothing store located in Kyoto.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cCDVJZgV1pCXHbMnUCcwm3KK2l8f9lkTP9ehXg-qSPpdzmlLkqqa9nQPbT555leiK3I7HKklqOTU8SU2-FrOCujJIzeAbi5pmkmYHP5qIrj_nkXmSPspyECIUvavi__mX7dBRoC0eTKzaY0zBtHdvkzIL_VgcbpJhP6R9zUh4P10QFKlIenPIKeJFSO1MvQ254JMh5qj_21YIXwo4CvPC1CbpUcztZYk29v7SID9Yz36l8r3FnRm39b7AytFL9yfL690jV3kD2IAd33xjw5GS8SX87Uop5QQFl4aT4SKegtg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://american-graffities.foodre.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'from_Antique',
  'Japan, 〒201-0014 Tokyo, Komae, Higashiizumi, 1-chōme−19−１ 扇屋ビル 501 5階',
  'Komae',
  'Komae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5779649, 35.6320358), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'from_Antique — Fashion boutique / clothing store located in 〒201-0014 Tokyo. Info: @from_antique, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dRPS_N3FU2r3BaSul6XCXWKoBuKfPtEMjwr10m7v-u8O9JIZLAbN0kZUGzw2PYYeFX42RgheFhaQXJKcaqU3dl3PtJ8kg6Yq63dycMYDUU0mdxEkDP-jD9qldCI5EwOqcijMXwkrQ922OZ3gKZe6zf_aEbgzLl3O9Xy-hMIngjOptetacYa3yrL3c2cNRICjG4oQ0SPLHv0UdB4vHCZws6CHj9kI6YUAwUGTu9LknFJevAO2p0IyZBfUb-ACJr7nZFwnx4g-B21zKV7w4HowK-xUlPZskAC4zrIZWdxG9EG6Q0qH0KUQSq9UzbAbj6JXsBhAX-Q5TkuwuAjy68xlkrVx3whfdOFHVr-rYglV-HukzpZ_l_rm978XHM-pogAwxnPAaZC18VlQmBjSelJV7Mv5T1uj0n8HZwCbIKQyBscg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/from_antique/',
  '@from_antique',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'GOOFYPHAT GALLARY古着屋（狛江、調布、登戸）',
  'Japan, 〒201-0014 Tokyo, Komae, Higashiizumi, 1-chōme−20−２ 永光ビル 3階',
  'Komae',
  'Komae',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.5775881, 35.6316379), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'GOOFYPHAT GALLARY古着屋（狛江、調布、登戸） — Vintage and used clothing shop located in 〒201-0014 Tokyo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cc51fQogEnwDZvfZ-8-lw1mQXXIuq8CvHRmntvRoB7bAeVCMRkfyHpCni8mboz7zYnzd52b_AFiM5WhFhCZWQqIsSQgd74-WPcmACfWtXWBaAlBups387w9eU83KoFflcDjdGegfKu9Zm8Sc26Cr5q-S-0RJ_6E3zwfKtgLV217O1-_owYqq8dbculXLpU3P4d9E_kAW6ARgEAYi6PICUNqMx-jBR1Ox3KxCr0juQgwSOzgJNcACImCq-btgnlw948iSgEZnI-xAbXbIoX2ZR_DUkzlMjX0Et8n4XeMWpqbo8M9X0BHIPROZo6Q2fkN-qQqvsVPgTVcnOkc8YPMBirO0WxNnsCQRUXi1nfv3JF6xYYkgAa_6Kr9dZWhkj_otJDOLp-b4ACTkjmEQFX-YM1w4gRtyherpNyeoqQwS827yO_&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://goofyphat.base.shop/?fbclid=PAZXh0bgNhZW0CMTEAAaY-uyJ1X0VkpuTn5DYcPsoiQxfx3pnjN7zwCXEp4Yd6zLfpLYTJcsBeWu4_aem_9T7IabTtxz4Eu0i8hBF0aA',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'TwoFace アメリカ古着 本厚木',
  'Japan, 〒243-0014 Kanagawa, Atsugi, Asahichō, 1-chōme−7−４ 第２三昇ビル 201',
  'Atsugi',
  'Kanagawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.3629755, 35.4376747), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'TwoFace アメリカ古着 本厚木 — Vintage and used clothing shop located in Kanagawa.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2exb2EDXHXiWGcbBD5J0P3OhMJcirJoMlFiBnmU1yZ_rYWIXmPLbJkjj7VHad7Z6xyp_62h1-Rcy8192WiDoqmYJL4jyyhVaZD_5mSE3CrNMdqACJW5hCF6MPJLS7fJWK2wTPNaZKnnGCf0S6ffZyW2IreNbqNU3KEtKh2_jZ4DMlBeJfmSjvJ6yjNV38JgvqyoYVB75JlyPUZoWjsAwyDRmjZzxQe44mFwX8lAdDRNgUzbCRftOQvUBuDH26XkBlHltt3uWijzcUwcPr1_pLNpO8lwE9kxPqJ1kJe8qDLSRIlMcqmeppwdo3ZOrlbhyKBFIOr6x9bH_NY-Tv7vAvCZ3-Xa6DIxoVxRP1yfboZMSEOyLs7jGdHNp-PjknIlPQa8X9O-5BIXUaSQlBUqAORwoViR0fZ8qX92eTzvhQ65lA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://twoface69.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Super 2nd Street Atsugi Hayashi',
  '1-chōme-15-6 Hayashi, Atsugi, Kanagawa 243-0816, Japan',
  'Kanagawa 243-0816',
  'Kanagawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.352277, 35.455371), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Super 2nd Street Atsugi Hayashi — Fashion boutique / clothing store located in Kanagawa.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fDeTJitVrWsVosOaG7CcRm_UYbQa1i6VCt4d2L-I3cWABLKVPCKcTEtjlxRqxe29-urE2-Gfl5gUqIWDCYGA6pPCJjXyteCDuxgkTcIIpPSfCRmUFYb3ACh_LjrgTe96_SN8mNLKwSFNrgmqOadARujgPaUQ9PXbDZigYlKFSEuOExmDHam2RCWWF7IhnrL5-mbRlPB_qet7QK36fIC4e2Dz6Xh7NbmHfV-bxKf2HHJCsDGkBTsQ2tYL9VkhgtKuS_1FYGbTRW_XdIzMkRK63GuIK-ZBW_PvuvQ3nrNBr4mk1IddJ-5Yk89P7mYK9YI4V9HuvWmvCB0XyB5ixM4ENoKB2HruCxSFuqtMjucse2YbeF3g3nKKSMEEuyNnxwDpVDS_ma4-58J_C9ip15FyXxPWVOfhH8h-ZTPUi_wZg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.2ndstreet.jp/shop/details?shopsId=31291',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'MATHEMATICS',
  'Japan, 〒612-0029 Kyoto, Fushimi Ward, Fukakusa Nishiurachō, 5-chōme−５３−１ ペガサスプラザ 201',
  'Fushimi Ward',
  'Kanagawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7678341, 34.9573867), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '林数学塾 — Fashion boutique / clothing store located in Kanagawa.',
  ARRAY[]::TEXT[],
  'http://hayashi-suugaku.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Why are you here.....? Mainstore',
  '4-chōme-13-3 Minamisenba, Chuo Ward, Osaka, 542-0081, Japan',
  'Osaka',
  'Shinsaibashi',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4979875, 34.6773503), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Why are you here.....? Mainstore — Fashion boutique / clothing store located in Chuo.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dp6Jfd99yd4lzV9kl8yLBreNev8DW13zCes0wkSb9n2OwPP6irPxhuyYMQCTUzQS3MDi6h1a0Sb-nB7mpDvv7sTU5xIonoyiQH9Ofv8mXQkAD0iXELP1vHIBy1BWcIGZjP6uHiXGg6wSPLpgaqiLLEXWuTrWOq2DZ1vhimyXfnXkfaJTaBPvfpJoDyzExeg0AtRjZwukTpUxPbdVFOt4J3U8TWoijRzyj0AZhIw_lG_52wmd2s7dIKbThJahH9lcoS4tQEByy5PQrzCe5HuYey2grO0jdDqZSF432cvlNKqA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://whyareyouhere.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'GWDH',
  '522 Masuyachō, Nakagyo Ward, Kyoto, 604-8053, Japan',
  'Kyoto',
  'Kyoto',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.7656808, 35.0043028), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'GWDH — Fashion boutique / clothing store located in Kyoto. Info: @gw.d.house, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fq5FlPIj84cjLfIedHS5hr-Jro-nWrJJupcnUsmwsnfwfElO8qGbVu-C_7a3HtTtmE3HCpOmu5mNIaSeoHmtAoUfAbekHESpxV4YiIatIaoAfNvhWUJplmFc35drQbSymM_Lm8dhKXvPw9U4X1pJk8fwu8qr0NPoKq8AJCRlKwxxz5q-s9oUUHubSnu2Du85Sl4f9FnrsF5v3aGWznHSrnUWcHpk5D92yt1mzgd6Lw4i2vA5DYZ2PNSvzkbncWo7zAmFW_nSL_qE-pnA0aOf4wVsdSTtsyPOscTvciZZHWtxQ8AzNTjtrMZcyALTuXjaci1AsjkpinGM9D82XmjRFUOCC7LdT5wBc8vO3iY1NjlVsrf_Xp_7ncfR4yLELHxda_70V7DTH0j5Y-tiLkoIqUnElFmRJSMO7ZaZQC6HK9Dlc&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/gw.d.house?igshid=YmMyMTA2M2Y=',
  '@gw.d.house',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '古着屋BLENDMARKET中崎町',
  'Japan, 〒531-0072 Osaka, Kita Ward, Toyosaki, 1-chōme−2−１０ 東平西原ハイツ 102',
  'Kita Ward',
  'Kyoto',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.5031685, 34.7101056), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '古着屋BLENDMARKET中崎町 — Vintage and used clothing shop located in Kita.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cWIo-QoVQ2ONByCrMd1kWi9mwn9WhqiS-EtzZU_dU-1sVtkTPgo5QteSFx_dtHPGl5gW6SZdrafHfo5Gyp45ruFCsopAVY-af1UVla6eQJbbNMKHDZWzoQAEACvr-jFZOMVdw6sbpQiGRBL-ZX9blf1B-zdedaVY-UW9l2rOl-15IIFERTOFv-i6TttlQ5ZyJ8KGxs9Ew_KCkNQ07ylRLUbjsXvM9gcwXaM3c2bm7GtbL6lIaOzoVW1GUIH9XOT2ZbDeIfpBDntg3dpVxratyDhhzTfg7RclDIJMsAzsiqUw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '古着屋 polaroid vintage【ポラロイド】',
  'Japan, 〒550-0014 Osaka, Nishi Ward, Kitahorie, 1-chōme−10−１３ 北堀江コレット 203',
  'Nishi Ward',
  'Horie',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4955706, 34.6739966), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '古着屋 polaroid vintage【ポラロイド】 — Vintage and used clothing shop located in Kita.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c8xA4c2Y4-lT2gW3cDpGPnXmAwFsFz-CecDLvjMN-Wd1RLDTGKWGmySqKBOKUQ_lh7jMWsB8ueaNrheiCCyk0eLlhm74IDeYvd49ZXcBGNClWIL4EWUxisvo56gwL5qSn5yjHteJno0tTT_ELLoEMtfGtn843Q-u_BJXmSg6R5AYCfTM_IfkhFifAe4U3pD643KHVFKudAbrukhT0yfxZkZV5JFt3iS1i_Pjnx-cx205wTGOwk0R9vydKSs62rXHA9FUeoaIXItiM1JfTwk3KdCbkyGBWF8t2dh6u4gWZJyXT5vzkx80K6Ph2r4tPzUNsf3Pvhw_IV89QaMRCXEcPoIlLK8BWnQe1dAm8a1nyyRkvZKyPP0v4c7LcY-Dc6uEb_cjrknJ8W9CmYpEFPwyoIf9k6foppZcqNe1Byb1lMYk0&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://polaroid.theshop.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'MOGI Folk Art',
  '3-chōme-45-12 Kōenjiminami, Suginami City, Tokyo 166-0003, Japan',
  'Tokyo 166-0003',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6480324, 35.7033065), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'MOGI Folk Art — Fashion boutique / clothing store located in Suginami. Info: @mogi_folk_art, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f7Dos0R0uXZeDRnGT0S7Kl5a7Qh_3oilV6OvVao3qisZ3N7Gomt8SWqkVWOrnZH4_4Ft_XO2Uhf_eJz23M89TU4O8wzSuo8I2FFIfLbeobzX_UDGhEx7tmxR1ptYb16ccG2DbmRbn_cCLR8Tve4EH7b7-lD_FNPRg3ZeY23w8WLTOHAjfcOsCPGKxGSuxWfiDGj-8i85YW1db6eTmhKINw4n-WuqVzl-0zT6datMX9lvrubnwYdrvrRmoyfXv2UjuDFpM2CLZSRbI-sKGKeyGV6qrgBHJAPoB1cLxV6Iob4XdqRgJh4vm3knndNQCJpCZAT68XU9oiRe-Bu1--kCCB5SSA2AiZp4R3OonTXQlrK7uTQmWIgv9ynIXVaGWvQotmTMP3rqHJdoBOCp5bAizvvs8bBGlWSn0FCN1UqaxLfA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/mogi_folk_art?igshid=NTc4MTIwNjQ2YQ==',
  '@mogi_folk_art',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Higan',
  'Japan, 〒166-0003 Tokyo, Suginami City, Kōenjiminami, 4-chōme−24−７ 白石ビル 2F',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6488966, 35.7036804), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Higan — Fashion boutique / clothing store located in Suginami. Info: @higan_tokyo, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cAfxga-cfU0ADsHJ-onjrN397DnKjPYihVBsvvC9gul87IaukBSUtsAshXVmD3F_DpwGdCcGGrMYxyYwLyG6qTIUmYVj_e_i_lSzsbpW_0KexMOZY6hlsv9drN3yRIwC2jAwJwSKggEmzq5nAdM3EaZZwaAftyw6NSUKTUvKW3BzkayWeFnhwBSLdEiMdb4aeJlmv1Ci4yxiWFiocu_5MztN9EZ0sFkA9pxwCkSI5cLcC2KyUoP_Xml4RTl6RH4qU--pn0oucasdNHyYkv-IAsWqdu9cUREasD5YtFwTi2rpgk3uLdFK6nVQwuCgdZHPOjW2ZvSIa2tXYWEIOHQU-Ap2-jyTdx6oa4bGQV6K7dh0SXCgDLxyvFbEfKNqS1Zfuo57_edyscVIvD8H3SNkXHKD4FUYtQ1Canqm-J2zHsRBHD&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://instagram.com/higan_tokyo?utm_medium=copy_link',
  '@higan_tokyo',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'RADICAL vintage&new clothing',
  '1-chōme-3-12 Hadaminamimachi, Kochi, 780-0026, Japan',
  '780-0026',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(133.5412729, 33.5753762), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'RADICAL vintage&new clothing — Vintage and used clothing shop located in 1-chōme-3-12 Hadaminamimachi.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cNmXPh4nfdhW1aTotVZR3RZ86PlBHQzaBREOecuHc_BiTA6GPebYc4HZLkhd1AabTYYqeBbOay3xQ2b96nRC4fIOl_REegj1jxDF9MabVEhIV6eVRTGeGnH6LjtLSBQMupKutlVdA2o-YRoTnc_u8Wx6oxfTDMBwcyJO3rciZE2pIcaU4XgOs6Y7ANlIsmXOMzonreNvdoU4quYRikE3KjL3P0JUX0G1ozRoXoYF45fGnIymsYsWDWxdWayjeaUs0nHhFtpaA4L-vKs69Eui9P1gwPPmnvuOzp5CZi2PACUvGEOHaEQ4d0owTj-26iNKIyr2J1hj6zrYBJjfbnAB096DcWAoWVGbMLNiphm2H_qPjRW0gzy_ExzHXVDG5yRF-cNk2H2bCKlsSVkhPHmUpxNDKF7wqQ8mmk-G3u_d2D8_g5&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://radical-vintage.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Cloud Closet',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 2-chōme−32−５ Bprスクエア神宮前 I 6F',
  'Shibuya',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7084669, 35.6723025), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Cloud Closet — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2eWCA7oZb-manSDmBGeom-gsO33nJcOS68ObWPd34TeAFx6Ie_uoeEBhhhciogo-hKFSCA2EPuYiOLq1Kss2vLhjyK4BrvI3c4z2P-iZf0DhlzgZ8_BWtAHqJiM0rPg9kSe9fD7Z5xx-JJRCNlg1Xzegemw40GHW6qv4LR93hs99cn44vfIPMYEUR-prWZcuxqrA_AU-jIc53MjGs-vkPIbVqcTf-WcvA0v6h4_fgwUWl5Ys19raWOWmiQaU9sOWCza5cN6U_VnlvGpRkZG1mP7sEtyMQ953ll6c5krhifDRw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://cloud-closet.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'SAFARI 1st Shop',
  'Japan, 〒166-0003 Tokyo, Suginami City, Kōenjiminami, 3-chōme−57−４ ベルシャトー高円寺 １F',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6482698, 35.703856), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'SAFARI 1st Shop — Fashion boutique / clothing store located in Suginami.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e90pxpTzPpCPMdVT3Dp0Nc73FM83H18SIdc7i9b8Lj2kplGaVlsjys7eSyxarz7tJ4kTrjo9sCNxbDu_AzPTFtvntYORsVOT9C9HM1PKNmEPO-BYB49Ff1uHH6bHQrRKiM66U46M5f4McSMGqQcKKS8moWhZALXXuHIpyjgMgfMUgQrxsjiJEGGqQ490k1BOIQvNZotFx7s2sWH1EnUfU4i8X9pqCl8ddszBeKu7jo_C9kw0IWZZ2vjCh2TQCUbORB8l7JKQPGUYR9vja5uXTlUGs69DhKbJddhwB0TG7NcyN1Ilo5JYzxgr1qFDFZbw2w8B9s_XaIw4mwhBVWJSUrn5VhKlI5S5DLuIyt4osbYnA2sJn4bIfa6yOFmcZ2qMR-pizZliW5HVXaBzxbZl_1w7OG5uTBVJnEiNgOF9e1u_ZG&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://e-safari.co.jp',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'BOZO 2',
  '3-chōme-37-24 Kōenjiminami, Suginami City, Tokyo 166-0003, Japan',
  'Tokyo 166-0003',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6479093, 35.702517), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'BOZO 2 — Fashion boutique / clothing store located in Suginami. Info: @bozo2_koenji, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fGSha46Wd0e8YfNPMKDXU7pWKkzEJ0XuUuQ1WjQ2AnbCyyLq9cqGAsGksoRl3Auzwv3K7E32H21w9vfGiTyutIYKPjp8NFWoD5f8G5CdDwcQ_nZp8WPQiVFO2We9DdtZS653pFFNBDY0I8ue4jykL-U9SqFsdGWyQ3IF86VGWALZ6D9ZgZt4pqU0tw8i8laVShOA44LwVsUUT1tVsdRhGumX_ofuvg-QuURlw_OMa2zXNeSPRV7zGfl0M0hGTIUZFFE7D6rALMXW1lkX9qqOgiEQ7U_SEyb6zwBxXqTzQBu-LeySIt3nGhiTIfTqanLwvUtvZJcDi2I6lCsB8EK10WHsq2CcWkSIBgZqXzmmVpbsEGVrhjAeu_TncFuACnQZIEP8fqE7t_vkKIxdgLmyZI6ZAuMS-WH7zxiPdV-nGHwA&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/bozo2_koenji?igsh=MWplbXZrcTlxc2VrZw==',
  '@bozo2_koenji',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'unstitch',
  'Japan, 〒166-0003 Tokyo, Suginami City, Kōenjiminami, 3-chōme−45−１３ 深瀬会館',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6481961, 35.7033635), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'unstitch — Fashion boutique / clothing store located in Suginami.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e_Z0RQspvysmKDZUB6rRKWxxSuQO1ZHEifEhsF4Mo12eS3f8Lki-7lVSwtv8CBLBsg8LmlgNG2k_Ho7sHkVKEcxUyh2MhHJNqXpqw-3LUYM_6DSr2mIAlq74BiFkcveW-KgWrP1EUP26KoKI1X4GZaQ5OIZ-XKRTaK-gsmtU7mDq8L-oViimsMKKSggwOOf1Qid3b7LxtIMw20GuUFK3gH-RrynqBSqBJaUpQgsy6T5F_ok5L3ZE6RlSXafRM4YugzIOC43je0vlNFF8OH7yyzqlF2g-lYC_j7Ruc2ju3nmAoaENLSdQGGlJ2y3N9jI7VdGskvDjo8CFvE22I1AFWVfPuUPcwtTW5jaCSt-rLHUYRhYImABfTtlFuK-hu8_llb440wfSgnCJf-V1b4MF8ZaoI9kAHHV5Dw-c_04Pfg9Q&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.unstitch.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Witty Vintage',
  'Japan, 〒153-0053 Tokyo, Meguro City, Gohongi, 2-chōme−13−１ アーバンフェニックス 1F',
  'Meguro City',
  'Meguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6909143, 35.6356299), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Witty Vintage — Vintage and used clothing shop located in Meguro. Info: @witty_vintage, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cy5IySul6lKsp620UfWow0k_VejraQ9bc04cnNCbrtwefBSsUymrP84d7LEKHCazgk2-Vmbp-FLhGsf7C9W4hKtHHgme7W1azqIItxpG1-P_yyPvnYco_6EMc9Onrz-0QLEOd8A78mfVWIurqIBMB4ZrbDeA8XGwvwfWYUf13NHENFCVg59VMqyVrMcae84r9H3m5QG8oq9hMzwdzF51G01_d5dO7M60yY_eiR3Sc303nQBTNmMAnDKIL4BDfI6odfv9lt8t-Fr_IBpMJPUvqgaegc2STmgZGEuq6cbCQTFw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/witty_vintage/?hl=ja',
  '@witty_vintage',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'REM',
  '1-chōme-92 Nagatachō, Fuji, Shizuoka 417-0055, Japan',
  'Shizuoka 417-0055',
  NULL,
  'Japan',
  ST_SetSRID(ST_MakePoint(138.6770233, 35.1622715), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'REM(アールイーモバイル)富士店 — Fashion boutique / clothing store located in 1-chōme-92 Nagatachō.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2d3Qlon1aBlh3x4KTMKHkuXTh3QaI9UrIhG8RAppAiiIRoTPCmSay0-AseKQeYqS4E13q_dVCEFpxxSYPvrjk-s2eh_BVkOrnaKvGGUnHf3p_1EECuNmxlEquKfu20gsuYYSonESQqe76Mp4y0K1VqS4q8OCcGFAPfYobybN_XhKzE68R1ZL8EPZPtb7HolW1S8ZI7vKaMKCHvczBiAswwJWbBzahtyyGlBXwDckmOX1b0254726auZw0nirgC4hq6RyJV3AxoaG1zWPFk3YmJ4U9xX-JGN7fKFoASJkeQv6Q&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://rem-fuji.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'RADD LOUNGE',
  'Japan, 〒150-0041 Tokyo, Shibuya, Jinnan, 1-chōme−13−１０ エッグビルディング',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7002117, 35.6639801), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'RADD LOUNGE — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f2UBQsZF_EzvRSlhu6Jyl-zAZmbVGLQxCGxNUTE-4mvqFkuEiUHA6QDOmE1S5ZvWQ0QQY8L1BptO-6emNa5raGkT6Kt6v6eNTR6vuR2ZTPrpW8_kVyhnF1T8sNZS0XofL2JadAP9Uq-Q5pRG_I1moUKtcBA5WZvCyck1nnPtlfojtr4w3InJMXmfOZIHgwYO3JE3zg0H2ejEZQYkRAxF8J7DFnc9QoZeLW3GvvfAUder0-7tzYSPHuRIgLkAXM-oGxt3Dr9nTvfEzXtj3rqN9YHLHOtwjvTgW8_nawCLf2Qw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.raddlounge.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'HOWDAY',
  '1-chōme-5-13 Chūō, Ueda, Nagano 386-0012, Japan',
  'Nagano 386-0012',
  'Nagano',
  'Japan',
  ST_SetSRID(ST_MakePoint(138.2521198, 36.3976597), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'HOWDAY — Fashion boutique / clothing store located in Chūō.',
  ARRAY[]::TEXT[],
  'https://howday.official.ec/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'SUNTRAP',
  'Japan, 〒166-0003 Tokyo, Suginami City, Kōenjiminami, 4-chōme−23−５ ACP#1F',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.649765, 35.70367), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'SUNTRAP — Fashion boutique / clothing store located in Suginami.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f5DdYv-zlHZpcIaDgCtw5O51UL9vy102ZtQiGRT2TwRu3BYisewwpOtE532N7i659EYpzf-zwcoKd13yOlxuX2YDCwJws_i3Xv15WXrvCcWnr3as8KPBIUFwX0xySHR1E8x_0eAmHTkTNDMbgg8obc0AtwhKQgsvZsBCBnvUTP_aaARTOeq3twij2fQNqjcJyjVrhNYlDipTHXyB0jnyFKAqrX1fTjd4VmTIhRu3a5HCz8xdiaXE3nkvFqkg8DJWKVFB2HIREB6Ii3Kid8kW9VmkO9PHK9ZtlyDwLOJ6SgKlA4CdOHtiJ0o6UI_NdBgK3VGnDtf2IYOCB6YkV7UY26WC7Y_B080ADw_OefwTtdbEXXD7vpNinLnr_YisvYyrgsAw41CdQWVCp49COeNlwflCZ3hnmswXv7X3tfx-Ncjw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.suntrap-tokyo.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Atlantis Vintage Tokyo',
  'Japan, 〒166-0003 Tokyo, Suginami City, Kōenjiminami, 4-chōme−25−３ 高南ビル 1F',
  'Suginami City',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.648977, 35.7042669), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Atlantis Vintage Tokyo — Vintage and used clothing shop located in Suginami.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c16pSdKyKpBPJ4eXIaBB6MpF-mSznLQB2X0fbYchNxMfciTvhysRUACJL4zfJf-JMbSlZ-DS9TYrEfukOX1qqbNYFzip9a_OCnjvfptDyw1rCc8sTrCw5LpnIeUgCfSBsVtMN5sHF20DJ3mcMxZgZTlt2NdY8642H3xK4WA9Vl4KLY9BNFegP6SQRck0RMj-u4YVX73_docD19y8QslImirs7PJzrxchFuwsZsqx8NjKqADp6gVfwkExgZnoNIe5GK6GQbB4iXxjkwQM24KCqr3oBxkUHtwp4634V7HKlxmQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://atlantisvintagetokyo.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Whistler',
  'Whistler, BC V8E, Canada',
  'Canada',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(-122.9535117, 50.1161686), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Whistler — Fashion boutique / clothing store located in Whistler.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2e0k1alWBzdkcE8doTfR0hYvDKCnXSlbizGMnHBYH-pNRU-ODNtjy0YStnOBnWP2f_9AbkR5wZbW-mLlaAJPpK8QGeRMAsMVpzTxiiIcI8XdHmrROyCTnzPNJPhQsFQfl5L11XVuMsbAFNOTkyHwNC8hWJIRQCuRKfMv9EpLkmo6qbtSZcA7JxyNNUSlX9lhWrHU9tQoUAXWVyKyq6-wKhQVY5DTt1XnPfdDXtb5N-nl5dktTeHRXZ-01MQiV3AMYtr5HCQ406J_ZXwkn-t4pA5MhUYlE9pSvGmZgG3TLqTVbwlPwU8pVXcTq3KnTFkk79DAc79WCwT4boUmL2LaoodolwTRgW7ucOyWwOzxvx5HV7Ps4T0vTlfAU0dTpx6T-e2X6dGoIePgObJEzGlGzmgNA5sNH7oBP1exJb4X5VwPw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://www.whistler.ca/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Hard Off',
  '4-chōme-151 Numa, Yao, Osaka 581-0036, Japan',
  'Osaka 581-0036',
  'Koenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.6069184, 34.5877399), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Hard Off Yaominami store — Fashion boutique / clothing store located in Osaka.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fkNcGB-oqD_eyrbcTWHQICMWwN2Rr8MRPsAZ4zhyTzlIi9teOyYFlLDuPfWDcKYphQv14mbV_cEK44Ww3uj5qsYnzEOzBx7WHLMA0gziMnunLan_zI9dj7fjgBkm8OdzymSDRJ1mrvadUI8RniFVqcMOFh1TF68pp-CntHnfXh4319xFbmd3z5uw1UTsBRFzF7qfGKq7HJgRS2YrLIX0uPTv2SjsLf6hLkzGzKcAixUPxH6iV7kOiXrMFoTIV27gLlN5O-wMtUUJ5jloKXX2WIdq3coibgHRryNvHQUfzKELWOn8ZKtUw-NGI8a6qU1WzCjj-6hYwk4Ko3UmmgyjHBFYDs3NOZk_Gc-aF-nFIJ32X1CvV9hI2zaajE2Bw8h4CfJrlpjMsTRJrEAP1BkllUbUgEZl2v001fLSBV9Ii0OQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.hardoff.co.jp/shop/detail/?p=101106',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'pug tokyo',
  'Japan, 〒155-0031 Tokyo, Setagaya City, Kitazawa, 2-chōme−15−１５ 末広ビル 1-B',
  'Setagaya City',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6672178, 35.6596994), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'pug tokyo — Fashion boutique / clothing store located in Setagaya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ce6phvEWfYfzyEfyYcVh1rDIS5DhOL52h-w-hcAirzwJUUkVV4BFJ5AUNtgAze6D1c8lKoJOH129HfTLzyBBL8LPzoctfRVeB_md2ifLVOogKGeGK9mglj6VfZ39URFCmEWnANW6EtguOgtMLyxbDk435U8G-1yZKIV_U8jSB7iXggCi5QRBcB-EsGPYWZ8XevdU9P_r5mrRB6HPjXH93OqK_ITZIbiouboFlrAEkAbYRrvSp0aD3P1mfT_4Yjkcf8aVxaSf6JiAGTeD3RaNFsLmk5HcKvnFrWXuHfDGpkQ6U4CvSP-il2tpQnyNGCXA4SRyLi8-IubLen-chjhUoyl0t8tW8PfjTo_YGm5b6C3-BuDcvfpWF1Dm-CQwl_liTiDoG9Pt7PUOn0IZdV-R--_p3oU-dbt9y18fOKI1MtgJ5SELNLZ7P5gW2XUKDs&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'RAGTAG Shimo-kitazawa',
  '2-chōme-34-12 Kitazawa, Setagaya City, Tokyo 155-0031, Japan',
  'Tokyo 155-0031',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6684763, 35.6630266), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'RAGTAG Shimo-kitazawa — Fashion boutique / clothing store located in Setagaya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dfQ6IgkXkLeixcdeI6uqf1Vybypq4JeLlk4LmmPXE6l8J5XQkbAyBq8Ot657o5IDN3umu5jtlDFcCYm7IofqmA3C3yWWPJ3nnNZiIN5_4c29Rto0ir5B2zmcbsyAWypnxKpw-kfelvTTBLwoGpG5YsUAWoKu6p5fvy5RUl0yTDbmSbqhr-3VzT2A0IC_2ZdvZ0rBIYC1Cw5Mq050loqY559BiNUNQzzd_4dlRhoDDvbI8M8K7RbbdWJHH7DtXTuZGufQkJm8VbFS8Yr03ZAB8j35IWBQVJQ6LceA32cj-bSw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.ragtag.jp/real-store/0000000006?utm_source=gbm&utm_medium=map&utm_campaign=store',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'OTSU TOKYO',
  'Japan, 〒155-0031 Tokyo, Setagaya City, Kitazawa, 2-chōme−33−６ グリーンテラスビル 1A(1F',
  'Setagaya City',
  'Shimokitazawa',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6686349, 35.6631781), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'OTSU TOKYO — Fashion boutique / clothing store located in Setagaya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dzyJEkD3ROHZuqUtZkWXvLAzr7IDiB6vaO5bh7dtPCu1HKCOxvj6B6x2ZwwQr6UGYmL_72YQuA-XWKfdJzVah4yVUvpPCNcrbUOfFxmyT5KzwlZi8k8LE3ouxgBPg6oiGgfvjQ7S4VlPABihGvVViX4vSMnW7qSZ-Ds5SLNFeZdIlYo6EcqmLyGMbdyn3lBf5eYa-FGpF5nqUs8IPU1mcU5vnkqEWsdBwQltPf57gbt9fHIMdgguy7_nOJK6weQtDBu8cjp6ZTajpXeDct9GE3ec-NN8YlLDsTmQpni547Yg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'olgou',
  '1-chōme-10-6 Kamimeguro, Meguro City, Tokyo 153-0051, Japan',
  'Tokyo 153-0051',
  'Nakameguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6989015, 35.6469206), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'olgou — Fashion boutique / clothing store located in Meguro. Info: @olgou_nakameguro_, website.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fYleWhdOvOV6KKCuU8C4_PO8nxuIoKZ5JxkHXglBkR1u_r86IrksaiH-6-AF90EPU-tH8gQtIYWLw700ytx3KoegQKIVJWusoqEPAKrng5H21EsGWy8UXTparFj05fJtXAtvrZoIpB-EKmRfloO5XsHgE8a9AT-c3sOpOp7EqLZcPlMyhNBkSRtydLyPqZViDwTVlqlNImMa4rXCajTc9F8yX6TV98vxpBRWkUckcfGH9qc0cCwUc2LP1xZafIdcmcFH3Jh0oQ_5b8PQknmyT3HfILAwWsYUoEcZvgpjlxqc6WX0-WDrU1cczlZRZO6nN_7fM-F7-0H0xQYbQiWTHVIiev1Q2zCTgk0PWPrgMN-69o4G9rt0H4eRL2P00GPeqvKoEVX9aejZi16YT9zsWuiN3E7HvFEr7Y83EFfklWCeIc&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.instagram.com/olgou_nakameguro_/',
  '@olgou_nakameguro_',
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Coverchord Nakameguro',
  'Japan, 〒153-0042 Tokyo, Meguro City, Aobadai, 1-chōme−23−１４ 斎藤ビル １階',
  'Meguro City',
  'Nakameguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6966616, 35.646847), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Coverchord Nakameguro — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fhZsuvPWrUWTgrvyIYysyvms0m9Z2sWTBzd1fgAoFlxIClcLh4mp1uYMDjclm3JdjcoVKCFRdCDN7SgceuzOALtND_T8Kdqb1uQJ1lUFL0UeKPkBTGNgOJO5CLx7oXTuWNVfVUXdznJRLKevat4V7Kz3JnYyZN-SQIdMXhB4EQ3CbzeQnVFCMgjow7wcn8bp_goY91kNXmPqkUU6qjzlxPnGXaQszIz1oo6iep3Uh7d_LEMWt4ndD7ZBwtzg3mgPqa_By60ORonFXWjuruNKwCACHjC42cooCJ18Q-5Dm8P6g_CiTKfCZtcJuMypbWflTrtOr-rjegh_WSsct2RUv3uuPAU1fO1zhUf5uMypStifT43DhhaFcTPx3mskinKCzSCDb8AHp14TL1YvVhHHx__CmYS6bxVgStMTi-LDKpBhi8&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://coverchord.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'GENERAL STORE',
  'Japan, 〒151-0066 Tokyo, Shibuya, Nishihara, 2-chōme−35−１ ブランエール代々幡 105',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6757642, 35.6751248), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'u; generalstore — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fSv_gqBOxPxItxcLIh93mjNSsUe5PQL1hgCBBtwAfkbVIk1gos_nBYlYpqJp2-hxVwEk5jFY9Ic3fZkplL4bBqHo_PYmEQok-RLPmc4FlQHtR8P-mgp5hkhtR0hjrtoLP7DnwADWgEibQ76Mt8wftFgr3r7AyVoTBa5TvBvQyvHNdT_Ygwm5g7af_g-R9_Di5S4kSDel9L_w7sbvj07F-ASUx3E5TPvONK-gY7G3BxA9eFKGGbYtJgKExkCEQQOqT1yOM5bi_1VcE6hrXPl9FcYKoteYGMK7-JfttYOyFgYQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://u-generalstore.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Jantiques',
  'Japan, 〒153-0051 Tokyo, Meguro City, Kamimeguro, 2-chōme−25−１３ エルレーブ中目黒',
  'Meguro City',
  'Nakameguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6965165, 35.6412525), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Jantiques — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2d-2C3MiAvFP2OtAb1u3t8CcLfXuiZi623BDfG-sosMwAg0VsbJObThzbR9a7CBiahTRyRpx6RTAcRFU0aRxzJ8Cs2dh08ax7of5fL437ZJXlRH15aDlGD5vLOA4EGVVd9thiMtHPZgJX5xSIJ_izCGdZZG44JxJOmTwjKz7vpFIbllwj3pCHBXGRpMHx-1PKGv14KDmuIoOvCjtadbp-NZ1iYrjGP8rngjeOlt2OjNgtghtb1KIjL4MaJiJjVY0YhR9hZ4eun9ZSdVVsGOvtjppKeC1DRAYWRFBVIe2FpITGB6npqvjLmj62fABl7NFd67wBJo5PTqT2--haM5QcN8nKUgp2-0ay2_nwJLdAocm8I1Zeau3Pu3bbHfeIkNen6bERqAGDCmK-FRmd4mdJXTIZQ3sevNCENaA4mM6ojkf_U8&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://jantiques05.buyshop.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'TEMPORARY',
  'Japan, 〒660-0883 Hyogo, Amagasaki, Kanda Kitadōri, 1-chōme−５ E&E Building, 7階',
  'Amagasaki',
  'Yutenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(135.4169788, 34.7199817), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'アスタッフ株式会社 尼崎支社 — Fashion boutique / clothing store located in Kita.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2fvEMeWDEzpbuW5BEiPGEqj7d-GcA_uT5E5jBNG5rbUGLGRPyPUBKH3C_BRwvGImdJX0Q3K9W21a4ZUKlj18ggRO8h2pEMOKLee78rZJqekZ24zFzci3WyrOLvAATjMys4dVih2AG8X7G1y5MCyxlbFxnx4-zVEabk46be6qprpl4gvkcLDAGO1rpOuWeTl0-2HiX-4GOhVwb4_03XLa6nd8XcdoWUtnULI45qhB8Y1G_3GvrfrsrwwZ-TyvHWV5OSFPp5KlJktwym7PRBDqYoD-T9E5FLAn409jqDsofUtkg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.astaff-green.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'PLUS EIGHTY ONE',
  'Japan, 〒153-0053 Tokyo, Meguro City, Gohongi, 2-chōme−15−７ 市川ビル 1F',
  'Meguro City',
  'Yutenji',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6923938, 35.6353781), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'PLUS EIGHTY ONE — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ceE5zUms-2KznnETaJ-yMT3i0oo3wI_g-ftf5PQlym-VY8aVdmO9AU57tRIjjWi_7ab-ScAcsA0_VoIhy4FOx7lh0aYEjSYdtR_UdGLlUbzJqNlZ874lrzf41N8GW0re2X44sBnxfhSuB-xDIYwdpQaWTY8BwwSjg1yrkQX_4F48FyRY_Qg24tF5tez0sFeYWgFLh-O7YfxqtPB84ygdI9cs2UzuUH0Q_82vpFSzK8Iyb1brGYFfjtMQpZT2iN36dYnERn_1bPA_kmAjH72dAW1ExDoVB6Xj7AfpHBRuvIa4PHr40Ii3KBZIQU0jjiJM2ykSsVe9QNp_ooXmUtTQAx_nDGoC_WdrbLvHUNJN2kBxBtimL99KXDcvjqJMc2IW9wTzcjjRw_mZGLYu-HW3olp-htFsO8n-APeASwxEEMZg8a&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.plus81.id/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'recollection Tokyo',
  'Japan, 〒153-0053 Tokyo, Meguro City, Gohongi, 2-chōme−15−１ アンドウビル 101',
  'Meguro City',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6921146, 35.635517), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'recollection Tokyo — Fashion boutique / clothing store located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ckERibNdxd8V71fHZxtSqeAZd1Md-Nhn4R8Qz0GDcs8mwukh4p1t7C-v5rRV71ydumEEcPSmBXTcfDd2cWBgL_GHyViH1S9W2_a8J7Ptlv9E-fa49IkkEUFi490ZEI31MXzfThZ9bzorDDDLrHt2jRjs0pfsbUBeWCe14jGIlrenTzMA62p9cP_CNSacRpWb2BYm9RY_SJ6xaQpVH7KSk5N8iYzYRwLZ18Wtsn-XpdAUqc4yHtoUzFlLN7BP973G8_DarKVK7kaDPiLK6VOYhZ8RAgjHl5k_H3Hk8mt3rtEQ&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://recollevin.base.shop/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'ELIMINATOR',
  'Japan, 〒150-0033 Tokyo, Shibuya, Sarugakuchō, 26−１３ グレイス代官山 一階',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.701073, 35.648644), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Eliminator — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2f1t_sjZNIKvWXKOmq730Qdd-vHjg7UyWhrC4U234FQvK7E0Ly7vmz00xvcPOdMUA1GNtNvTtz1jzvKBmjvNyDLtuZlSEt3mAIlRU4Kr-9hRqphfjR670H9nwqRoUDvnAvOlTCYXVwnl7gI1aoFO4-OXWUiFxCpTdrUkogH-IilTsj72afVE9shUxWlbrKPry6ZhR2_bbMlGrf4CQGMvCVGMPK90MpIMWC1eUrhGMDa33du2sOUzjonXp5w3zqQ1p0xCSb8rIToJTCNON9RYXK5knx8DmhHhp-VqvIPIiXUqDxXK2ZkWAXgbhgPbAKenBiVbFx-1LTNpadOiN7yTCePz84mDVOv_4x3yzYzeEnVriwwFthCCKDKVpu6LIT9vIA-aRU8MCofGZZWGTVfAeBaK_jbDlQF5t_Z3kuEQ78mn9bX&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://www.eliminator.co.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'NEXUSⅦ.',
  'Japan, 〒150-0001 Tokyo, Shibuya, Jingūmae, 3-chōme−27−１５ 福住ビル 1F-A',
  'Shibuya',
  'Shibuya',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7085413, 35.6716388), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'NEXUSⅦ. — Fashion boutique / clothing store located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2dWwpU9GxtAadU6c6awXH-QMMp5rM2pUmx4huDDHlCFQcEzVTp94xKC6f5JMa8uTnu6U27dHon46feeTErZpjC8wZRRxOMmLr170HxkvQk85bMXSKmlcVGJwH9-hZSUZnRFG8brqU7KcJ50IfpnEDsP7n8ktkq0V9-l8FHUFg2LkqzDX3WdjJKHAWLSY-6pokubz4J--L4JBQT5TqlrC8sOMP-L4jqXw-G6ywl0BXAtns6cGQQ1coIkQaV8IHqVXsxOt3nIDzLZzeCIwOwH8VTb2yGH4GzhWbYL3RGitCgUqEpc3pSds9Qzw5sz7Fzi-bjfKcyDIDJZQXISnG6vnRnZFVq5ID5uS2B_q4h8FNSn1elgRnNNHCOwK7E9EgKODUpjf1eCBNkhPbiKwucQcMV8dNnicjhfnCY5vZreWarqbouXMT5XC76Qzo3QJv_R&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://nexusvii.jp/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Neighbor',
  '3-chōme-24-9 Jingūmae, Shibuya, Tokyo 150-0001, Japan',
  'Tokyo 150-0001',
  'Harajuku',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7077114, 35.6711147), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  '3-chōme-24-9 Jingūmae — Fashion boutique / clothing store located in Shibuya.',
  ARRAY[]::TEXT[],
  NULL,
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Brooch Omotesando',
  'Japan, 〒107-0062 Tokyo, Minato City, Minamiaoyama, 5-chōme−9−２１ 青南ビル B1F',
  'Minato City',
  'Omotesando',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7112322, 35.6634098), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Brooch Omotesando — Vintage and used clothing shop located in Minato.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2c9gzrCnlzYlRX6OGI-N2hpgKGSv8F-egUfd6x7jNAx4O3wQye9phJtWx-fE9JQCecgjQf9zOCvc5Rkshfy2ad3rnHPqA3sa9vBSUNZSkgGZilFCdqMFQ-8dOccEB36qoU3btjLS2Ovf1S-jsgni07JhYStZ0hfpuV4sgmZt-0v3Y6l3TXz8sg_fLYDRS023g5qpK72AKwxJfK-bPTb5UgTOUcXS04RzvWs1pfsA--tDJL3gO0HJ1HC3GzZSJxrrZ99rsPh1ZR5U7mt-WBAaLAYCMhVoRBQ1MVTQ_RNX15W8Mgvxx8Tc-I7ghgMVfpyzr_Qug0NP4lqT5GIqEz7ptOrEiYG4REgp4ifZcu2dnzidWZsBROAVoOppjtkVxYB2QvS8ErBLiZDOJL0QooZWY1eKkT67-_ghhTUnSr7LNCmlg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://brooch-usedselect.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Brooch Nakameguro',
  '2-chōme-44-7-103 Kamimeguro, Meguro City, Tokyo 153-0051, Japan',
  'Tokyo 153-0051',
  'Nakameguro',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.6965384, 35.6414399), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Brooch Nakameguro — Vintage and used clothing shop located in Meguro.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2cdyHM1OAXPNyfScphCw9_QHc8H0IBJyv0uBu01ZSftmVyY-BaLB8bjQgyTznTtAxf4Qdp_6GiEgBiyC2P8VDpSzdtyCsFo6IpaJtu5Hw1UKQkFT42BK4dq6ABEB1iu5Xcpg0TJmXh15nUQd0ycPVUma2ZuNgwL0l0GzJCMAdCAFpdJG59bgisgt2RoZo5zzurXNA4Ed433ca7VfwCfZuo0SXYNJ-lUYyADJxzujROJaXet4Uap4OFc1e3DZoiQEx3FO85nO7UMML1jkUppkHuZilN2dj0gg9JLyHlVm6MBtg&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://brooch-usedselect.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'Brooch Daikanyama',
  'Japan, 〒150-0034 Tokyo, Shibuya, Daikanyamachō, 13−８ キャッスルマンション代官山101',
  'Shibuya',
  'Daikanyama',
  'Japan',
  ST_SetSRID(ST_MakePoint(139.7048314, 35.6504287), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'Brooch Daikanyama — Vintage and used clothing shop located in Shibuya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2d3aJrtT0l7DdbsQKwi7WAIm1bJ5i3pzl1c4OR8PHX6CuRv5EzZQ2lq5sS7aSgTPgAmCwxdzAGEB2yifBv9j3-nkhR_ysUDbBMxHbY3TIPpaNUovHPoqUW8lQGiAC2x5fVpBN1UMmgiocZX7vyEtPqUg8MaYKFZJJ5Gch8WxwDfYfwRTcC7il6yC6AFKhabBcNg4PUj8LQ5gsCHbIvZyv_SNQEsv2zv_tDT66KnAlSYGy8uKnCOv2szquHMYWeqsTFoh4pnbfMJoafn992a8bVJKMbAmClONJxLT-JfKQKB934cRP5UScJnb3i8a1XOSUQhD9uDYrg8b6xwD8fKStqXpC0EEO5DLH5zICGnW5LlCOMyJzMgIFBuoumubdVgpskyDcqMaSJShvN1Bz9HoA__VyiQuqI0m39e3iPLxyUkwlu2iuTppO3ymmUIKP7x&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'http://brooch-usedselect.com/',
  NULL,
  true
);

INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  'WHY NOT',
  'Japan, 〒460-0008 Aichi, Nagoya, Naka Ward, Sakae, 3-chōme−31−８ Mori Dia Heights Sakae, 1F',
  'Nagoya',
  'Nagoya',
  'Japan',
  ST_SetSRID(ST_MakePoint(136.90803, 35.163834), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  'ブランド古着の買取・販売専門 WHY NOT — Vintage and used clothing shop located in Nagoya.',
  ARRAY['https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AciIO2ez73X4ghizb28c3FS8jeNVEk9hTYpsH6GoeRhRqaf9n3KsFTi2ajqjGeD_IRoOE4AZYRs0_AWcAsMLkIYJ3sI2Jn6Ze9iH7pG6xJWn6DJDVKIANajkVdhllXwzliz-ZtLcIU889IQaOE1qwNWKsR7tux-viyoICQjsy_65qjBPC9vROVnVEulcqnDVsG4HGNtropIlOR5W1Q3A1YWvXl2EkvgZ5H0aPaRdutq73zUpyXnjYEcJqvzRjJ3oy3suDQJNJzHOkTe1O0_z5CCZt6vc00ExqsUB1t2mt6b8GNrGifuJVqvQ2padms07are2t9a4dj4tp7Kom5Gz2acI5p8MeM27cCT9EX3o41miEWRZdo1UyWkhvAaNDwpXzJQnC-D59yudVnOY3QXKQ-1bZ0V9A1_O8OYMO-FeUijzIckiuw&key=AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E'],
  'https://whynot.jp/',
  NULL,
  true
);
