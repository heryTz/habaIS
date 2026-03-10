# Guide de calcul de l'Impôt Synthétique (IS) à Madagascar

Ce document décrit comment calculer l'**Impôt Synthétique (IS)** à Madagascar selon le **Code Général des Impôts (CGI Madagascar)**.
Il inclut toutes les règles : minimum légal, réductions, acomptes et percepteur minimum.

---

## 1. Inputs requis

| Input | Type | Description |
|---|---|---|
| `CA` | Number | Chiffre d'affaires annuel de l'année précédente (N-1) |
| `charges_eligibles` | Number | Somme des charges éligibles à réduction (achats/services facturés, salaires déclarés) |
| `acomptes_payes` | Number | Total des acomptes déjà payés pour N-2 ou N-1 |
| `acompte_N` | Number (optionnel) | Acompte à payer pour l'année N (souvent ~5 % du CA N-1) |
| `minimum_perception` | Number | Montant minimum légal à percevoir (souvent 16 000 Ar ou 3 % du CA) |

---

## 2. Étapes du calcul

### Étape 1 – Arrondir le chiffre d'affaires

Arrondir à la **dizaine de milliers inférieure**.

```
CA_arrondi = floor(CA / 10_000) * 10_000
```

### Étape 2 – Calculer l'IS brut

```
IS_brut = CA_arrondi * 0.05
```

### Étape 3 – Appliquer la réduction pour charges éligibles

Réduction : 2 % des charges éligibles.

```
reduction = charges_eligibles * 0.02
IS_apres_charges = IS_brut - reduction
```

### Étape 4 – Vérifier le minimum légal

L'IS après réduction ne peut pas être inférieur au minimum de perception.

```
IS_minimum = max(IS_apres_charges, minimum_perception)
```

### Étape 5 – Déduire les acomptes déjà payés

```
IS_solde = IS_minimum - acomptes_payes
if IS_solde < 0:
    IS_solde = 0  # L'excédent d'acompte n'est généralement pas remboursé
```

### Étape 6 – Calculer l'acompte pour l'année N

En pratique, souvent 5 % du CA N-1.

```
acompte_N = CA_arrondi * 0.05
```

### Étape 7 – Calculer le montant total à payer

```
total_a_payer = IS_solde + acompte_N
```

---

## 3. Exemple complet

| Élément | Montant |
|---|---|
| CA 2025 | 40 000 000 Ar |
| Arrondi | 40 000 000 Ar |
| IS brut (5 %) | 2 000 000 Ar |
| Charges éligibles | 1 950 000 Ar |
| IS après réduction | 50 000 Ar |
| Minimum légal (16 000 Ar ou 3 % du CA) | 1 200 000 Ar |
| IS avant acomptes | 1 200 000 Ar |
| Acomptes déjà payés | 700 000 Ar |
| Solde IS N-1 | 500 000 Ar |
| Acompte N | 2 000 000 Ar |
| **Total à payer** | **2 500 000 Ar** |

---

## 4. Notes importantes pour l'implémentation

- Toujours arrondir le CA à la dizaine de milliers avant le calcul.
- Réductions : seulement sur charges éligibles validées par l'administration fiscale.
- Minimum légal : appliquer après réduction, avant déduction des acomptes.
- Acomptes déjà payés : soustraire pour obtenir le solde.
- Acompte N : à inclure pour paiement simultané.
- Solde IS final ne peut pas être négatif.
- Si les acomptes dépassent l'IS, l'excédent n'est généralement pas remboursé.
