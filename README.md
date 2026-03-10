# HabaIS — Calculateur d'Impôt Synthétique

Application web de calcul détaillé de l'**Impôt Synthétique (IS)** à Madagascar.
Saisissez vos paramètres comptables et obtenez le détail complet du calcul, du CA brut jusqu'au total à payer.

## Calcul de l'IS

1. **CA arrondi** = ⌊ CA / 10 000 ⌋ × 10 000
2. **IS brut** = CA arrondi × 5 %
3. **Réduction** = charges éligibles × 2 %
4. **IS après charges** = IS brut − réduction
5. **IS minimum** = max(IS après charges, minimum légal de perception)
6. **IS solde** = max(0, IS minimum − acomptes déjà payés)
7. **Total à payer** = IS solde + acompte N *(par défaut : CA arrondi × 5 %)*

## Référence

[Code des impôts 2025](https://textes.lexxika.com/lois-malagasy/code-des-impots-2025-4/)
