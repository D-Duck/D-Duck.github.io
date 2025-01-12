**Databázové technológie ETL projekt chinook**

**Autor**: Erik Kováč

Môj projekt je zameraný na spracovanie údajov z databázy Chinook prostredníctvom ETL procesu, pričom dáta sú organizované v rámci hviezdicovej schémy.

**Zdrojový dataset:** 
Chinook databáza je vzorová relačná databáza obsahujúca informácie o hudobných albumoch, skladbách, interpretoch, zákazníkoch, objednávkach a faktúrach.
Údaje z tejto databázy budú transformované a optimalizované na analytické účely prostredníctvom platformy Snowflake.

---
## **1. Úvod a popis zdrojových dát**
Cieľom semestrálneho projektu je analyzovať dáta v databáze Chinook, pričom sa zameriame na používateľov, ich preferencie a a kúpi skladieb. 
Táto analýza umožní identifikovať trendy v záujmoch používateľov, najpopulárnejšie položky (napríklad skladby alebo albumy) a správanie používateľov.
Dataset obsahuje tabulky:
- `playlist`: Informácie o playlistoch vytvorených užívatelmi.
- `playlisttrack`: Spojovacia tabuľka pre playlisty a skladby.
- `track`: Informácie o skladbách.
- `album`: Informácie o hudobných albumoch.
- `artist`: Informácie o interpretoch.
- `customer`: Informácie o zákazníkoch.
- `employee`: Informácie o zamestnancoch.
- `genre`: Informácie o žánroch skladieb.
- `invoice`: Informácie o fakturach a predajoch.
- `invoiceline`: Dodatočné informácie k faktúram.
- `mediatype`: Dodatočné informácie o type média skladby.
 
---
### **1.1 Dátová architektúra**

 Dáta sú usporiadané v relačnom modeli, ktorý je znázornený na **entitno-relačnom diagrame (ERD)**:

<p align="center">
  <img src="https://github.com/D-Duck/SCHL_ChinukETL/blob/main/erd/Chinook_ERD.png" alt="ERD Schema">
  <br>
  <em> Entitno-relačná schéma Chinook </em>
</p>

---
## **2 Dimenzionálny model**

Navrhnutý bol **hviezdicový model (star schema)**, pre efektívnu analýzu kde centrálny bod predstavuje faktová tabuľka **`fact_invoice`**, ktorá je prepojená s nasledujúcimi dimenziami:
- **`dim_track`**: Zahŕna údaje o skladbách , albumoch , interpretoch a žánroch.
- **`dim_customer`**: Obsahuje informácie o zákazníkoch, ktorí vykonali nákupy.
- **`dim_employee`**: Obsahuje informácie o zamestnancoch, ktorí sa podieľali na transakciách.
- **`dim_billing_adress`**: Táto tabuľka obsahuje informácie o geografických lokalitách.
- **`dim_date`**: Táto tabuľka poskytuje podrobnosti o čase a dátumoch pre analýzu. 



<p align="center">
  <img src="https://github.com/D-Duck/SCHL_ChinukETL/blob/main/scd/star.png" alt="ERD Schema">
  <br>
  <em> Star schema Chinook </em>
</p>

---
## **3. ETL proces v Snowflake**
ETL proces v Snowflake pozostával z troch hlavných fáz: extrahovanie (Extract), transformácia (Transform) a načítanie (Load). Tento proces slúžil na spracovanie zdrojových dát zo staging vrstvy do viacdimenzionálneho modelu vhodného na analýzu a vizualizáciu.

---
### **3.1 Extract (Extrahovanie dát)**
Dáta zo zdrojových súborov vo formáte .csv boli nahrané do Snowflake do dočasného úložiska nazvaného TEMP_STAGE. Pred nahraním dát bola inicializovaná databáza, dátový sklad a schéma. Následné kroky zahŕňali nahratie údajov do staging tabuliek. Proces bol inicializovaný pomocou nasledujúcich príkazov:

```sql
CREATE DATABASE IF NOT EXISTS SWORDFISH_CHINOOK;
USE DATABASE SWORDFISH_CHINOOK;

CREATE WAREHOUSE IF NOT EXISTS SWORDFISH_CHINOOK_WAREHOUSE;
USE WAREHOUSE SWORDFISH_CHINOOK_WAREHOUSE;

CREATE SCHEMA IF NOT EXISTS SWORDFISH_CHINOOK.stages;
CREATE OR REPLACE STAGE temp_stage;
```

Kroky extrakcie dát:

Vytvorenie staging tabuliek pre všetky zdrojové údaje (napr. zamestnanci, zákazníci, faktúry, skladby, žánre, atď.).  Použitie príkazu COPY INTO na nahranie dát z .csv súborov do príslušných staging tabuliek:

Príklad pre tabuľku employee_stage:

```sql
CREATE OR REPLACE TABLE employee_stage(
    EmployeeId INT,
    LastName VARCHAR(20),
    FirstName VARCHAR(20),
    Title VARCHAR(30),
    ReportsTo INT,
    BirthDate DATETIME,
    HireDate DATETIME,
    Address VARCHAR(70),
    City VARCHAR(40),
    State VARCHAR(40),
    Country VARCHAR(40),
    PostalCode VARCHAR(10),
    Phone VARCHAR(24),
    Fax VARCHAR(24),
    Email VARCHAR(60)
);

COPY INTO employee_stage
FROM @stages.TEMP_STAGE/employee.csv
FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1);
```

Rovnaký prístup sa aplikoval na všetky ostatné zdrojové dáta, pričom pre každý súbor bola vytvorená štruktúrovaná staging tabuľka.
---
### **3.2 Transfor (Transformácia dát)**
Transformácia dát zahŕňala vyčistenie, obohatenie a reorganizáciu údajov do dimenzií a faktových tabuliek, ktoré umožňujú viacdimenzionálnu analýzu.

Príklad transformácie:

Dimenzia dim_date: Táto dimenzia uchováva informácie o dátumoch spojených s fakturačnými údajmi. Obsahuje odvodené atribúty ako rok, mesiac, deň, týždeň a štvrťrok.

```sql
CREATE OR REPLACE TABLE dim_date AS
SELECT
    ROW_NUMBER() OVER (ORDER BY unique_dates.InvoiceDate) AS id_date,
    EXTRACT(YEAR FROM unique_dates.InvoiceDate) AS year,
    EXTRACT(MONTH FROM unique_dates.InvoiceDate) AS month,
    EXTRACT(DAY FROM unique_dates.InvoiceDate) AS day,
    EXTRACT(WEEK FROM unique_dates.InvoiceDate) AS week,
    EXTRACT(QUARTER FROM unique_dates.InvoiceDate) AS quarter,
    unique_dates.InvoiceDate AS timestamp
FROM (
    SELECT DISTINCT InvoiceDate
    FROM invoice_stage
) unique_dates;
```

Dimenzia dim_customer: Obsahuje údaje o zákazníkoch ako meno, adresa, mesto a krajina, odvodené zo staging tabuľky customer_stage.

```sql
CREATE OR REPLACE TABLE dim_customer AS
SELECT
    CustomerId AS id_customer,
    Company AS company,
    Country AS nationality,
FROM customer_stage;
```

---    
### **3.3 Load (Načítanie dát)**
Po úspešnom vytvorení dimenzií a faktových tabuliek boli staging tabuľky odstránené, aby sa optimalizovalo úložisko. Príklad čistenia staging tabuliek:

```sql
DROP TABLE IF EXISTS employee_stage;
DROP TABLE IF EXISTS customer_stage;
DROP TABLE IF EXISTS invoice_stage;
DROP TABLE IF EXISTS invoiceline_stage;
DROP TABLE IF EXISTS playlisttrack_stage;
DROP TABLE IF EXISTS track_stage;
DROP TABLE IF EXISTS genre_stage;
DROP TABLE IF EXISTS playlist_stage;
DROP TABLE IF EXISTS album_stage;
DROP TABLE IF EXISTS artist_stage;
DROP TABLE IF EXISTS mediatype_stage;
```

---
## **4 Vizualizácia dát**
<p align="center">
  <img src="https://github.com/PalcivaPapricka/DT_projekt_chinook/blob/main/Chinook_Dashboard.PNG" alt="ERD Schema">
  <br>
  <em> Dashboard Chinook datasetu </em>
</p>

---  

### **4.1 Štvrťročné príjmy**
Táto vizualizácia poskytuje prehľad o celkových príjmoch v každom štvrťroku za jednotlivé roky. Pre zobrazenie časových období používa kombináciu roku a štvrťroka vo formáte "rok-Q(štvrťrok)" (napr. "2023-Q1"). Celkové príjmy sú vypočítané ako súčet hodnôt faktúr, ktoré sú spojené s príslušnými dátumami cez tabuľku dátumov. Tento pohľad je užitočný na analýzu sezónnych trendov v predaji, napríklad na zistenie, či určité štvrťroky vykazujú vyšší výkon ako ostatné. 

```sql
SELECT 
    CONCAT(d.year, '-Q', d.quarter) AS year_quarter,
    SUM(f.total) AS total_revenue
FROM 
    fact_invoice f
JOIN 
    dim_date d ON f.dim_date_id = d.id_date
GROUP BY 
    d.year, d.quarter
ORDER BY 
    d.year, d.quarter;
```

<p align="center">
  <img src="https://github.com/PalcivaPapricka/DT_projekt_chinook/blob/main/Vizualization%20screenshots/trzbazastrvtrok.PNG" alt="ERD Schema">
  <br>
  <em> Star schema Chinook </em>
</p>

---  

### **4.2 Priemerné hodnota predaja podla typu média**
 Táto vizualizácia analyzuje predaje podľa typu média. Pre každý typ média vypočíta priemernú hodnotu predajov na základe faktúr priradených ku konkrétnym skladbám. Umožňuje identifikovať najvýnosnejšie typy médií.
 
```sql
SELECT 
    t.media_type, 
    AVG(f.total) AS avg_sale_value
FROM 
    fact_invoice f
JOIN 
    dim_track t ON f.dim_track_id= t.id_track
GROUP BY 
    t.media_type
ORDER BY 
    avg_sale_value DESC;
```

<p align="center">
  <img src="https://github.com/PalcivaPapricka/DT_projekt_chinook/blob/main/Vizualization%20screenshots/Priemernahodnotapodlamedia.PNG" alt="ERD Schema">
  <br>
  <em> Star schema Chinook </em>
</p>

--- 

### **4.3 Počet nákupov podla národnosťí**
 Táto vizualizácia ponúka pohľad na rozdelenie počtu nákupov podľa národnosti zákazníkov.Výsledky sú zoradené podľa počtu nákupov v zostupnom poradí, čo umožňuje identifikovať najvýznamnejšie národnosti z hľadiska zákazníckeho správania. 
 ```sql
SELECT
     dc.nationality, COUNT(fi.id_invoice) AS total_purchases
FROM
      fact_invoice fi
JOIN
      dim_customer dc ON fi.dim_customer_id = dc.id_customer
GROUP BY
      dc.nationality
ORDER BY
     total_purchases DESC; 
```

<p align="center">
  <img src="https://github.com/PalcivaPapricka/DT_projekt_chinook/blob/main/Vizualization%20screenshots/PredajePodlaNarodnosti.PNG" alt="ERD Schema">
  <br>
  <em> Star schema Chinook </em>
</p>


---    

### **4.4 Ročná priemerná hodnota objednávky**
 Táto vizualizácia vypočíta priemernú hodnotu faktúr pre jednotlivé roky. Spája údaje o faktúrach s tabuľkou dátumov, aby bolo možné presne určiť, do ktorého roku jednotlivé faktúry patria. Táto vizualizácia umožňuje sledovať, či dochádza k nárastu alebo poklesu priemernej hodnoty objednávok.
 ```sql
SELECT
    dd.year, AVG(fi.total) AS avg_order_value
FROM
   fact_invoice fi
JOIN
   dim_date dd ON fi.dim_date_id = dd.id_date
GROUP BY
   dd.year
ORDER BY
   dd.year;
```

<p align="center">
  <img src="https://github.com/PalcivaPapricka/DT_projekt_chinook/blob/main/Vizualization%20screenshots/HodnotaNakupuzaRok.PNG" alt="ERD Schema">
  <br>
  <em> Star schema Chinook </em>
</p>


---    

### **4.5 Rozdelenie príjmov za rok podľa žánrov**
 Táto vizualizácia analyzuje celkové príjmy podľa hudobného žánru v priebehu jednotlivých rokov. Pre každý rok a žáner vypočíta súčet hodnôt všetkých faktúr, ktoré súvisia so skladbami daného žánru. Výsledky sú zoradené chronologicky podľa roku a zároveň zostupne podľa príjmov pre jednotlivé žánre, čím sa zviditeľnia najúspešnejšie žánre v danom období. 
 ```sql
SELECT
   dt.genre_name, dd.year, SUM(fi.total) AS total_revenue
FROM
   fact_invoice fi
JOIN
   dim_track dt ON fi.dim_track_id = dt.id_track
JOIN
   dim_date dd ON fi.dim_date_id = dd.id_date
GROUP BY
   dt.genre_name, dd.year
ORDER BY
   dd.year, total_revenue DESC;
```

<p align="center">
  <img src="https://github.com/PalcivaPapricka/DT_projekt_chinook/blob/main/Vizualization%20screenshots/TrzbaPodlaZanru.png" alt="ERD Schema">
  <br>
  <em> Star schema Chinook </em>
</p>



Autor: Viktor Kramár
