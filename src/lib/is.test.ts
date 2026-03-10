import { calculerIS } from './is'

describe('calculerIS', () => {
  describe('arrondi du CA à la dizaine de milliers inférieure', () => {
    it('arrondit un CA non-multiple de 10 000 vers le bas', () => {
      const result = calculerIS({
        CA: 40_123_456,
        charges_eligibles: 0,
        acomptes_payes: 0,
        minimum_perception: 16_000,
      })
      expect(result.CA_arrondi).toBe(40_120_000)
    })

    it('laisse intact un CA déjà multiple de 10 000', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 0,
        minimum_perception: 16_000,
      })
      expect(result.CA_arrondi).toBe(40_000_000)
    })
  })

  describe('IS brut (5 % du CA arrondi)', () => {
    it('calcule 5 % du CA arrondi', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 0,
        minimum_perception: 16_000,
      })
      expect(result.IS_brut).toBe(2_000_000)
    })
  })

  describe('réduction pour charges éligibles (2 %)', () => {
    it('soustrait 2 % des charges éligibles de l\'IS brut', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 1_950_000,
        acomptes_payes: 0,
        minimum_perception: 16_000,
      })
      expect(result.reduction).toBe(39_000)
      expect(result.IS_apres_charges).toBe(1_961_000)
    })

    it('retourne 0 de réduction si pas de charges éligibles', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 0,
        minimum_perception: 16_000,
      })
      expect(result.reduction).toBe(0)
      expect(result.IS_apres_charges).toBe(2_000_000)
    })
  })

  describe('minimum légal de perception', () => {
    it('applique le minimum légal quand l\'IS après charges est inférieur', () => {
      // IS après réduction = 50 000, minimum = 1 200 000 → utilise minimum
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 97_500_000, // réduction = 1 950 000 → IS = 2M - 1.95M = 50 000
        acomptes_payes: 0,
        minimum_perception: 1_200_000,
      })
      expect(result.IS_minimum).toBe(1_200_000)
    })

    it('garde l\'IS après charges quand il dépasse le minimum légal', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 0,
        minimum_perception: 16_000,
      })
      expect(result.IS_minimum).toBe(2_000_000)
    })

    it('accepte le minimum légal comme pourcentage du CA (3 % du CA)', () => {
      // minimum_perception passé en valeur absolue par l'appelant
      const minimum = Math.round(40_000_000 * 0.03) // 1 200 000
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 97_500_000,
        acomptes_payes: 0,
        minimum_perception: minimum,
      })
      expect(result.IS_minimum).toBe(1_200_000)
    })
  })

  describe('déduction des acomptes déjà payés', () => {
    it('soustrait les acomptes du solde IS', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 500_000,
        minimum_perception: 16_000,
      })
      expect(result.IS_solde).toBe(1_500_000)
    })

    it('ramène le solde à 0 si les acomptes dépassent l\'IS (pas de remboursement)', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 5_000_000,
        minimum_perception: 16_000,
      })
      expect(result.IS_solde).toBe(0)
    })
  })

  describe('acompte pour l\'année N', () => {
    it('calcule 5 % du CA arrondi comme acompte N', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 0,
        minimum_perception: 16_000,
      })
      expect(result.acompte_N).toBe(2_000_000)
    })

    it('utilise un acompte_N personnalisé si fourni', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 0,
        minimum_perception: 16_000,
        acompte_N: 999_999,
      })
      expect(result.acompte_N).toBe(999_999)
    })
  })

  describe('total à payer', () => {
    it('additionne le solde IS et l\'acompte N', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 500_000,
        minimum_perception: 16_000,
      })
      // IS_minimum=2M, solde=1.5M, acompte_N=2M → total=3.5M
      expect(result.total_a_payer).toBe(3_500_000)
    })

    it('total ne peut pas être négatif quand solde est 0', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 5_000_000,
        minimum_perception: 16_000,
      })
      // IS_solde=0, acompte_N=2M → total=2M
      expect(result.total_a_payer).toBe(2_000_000)
    })
  })

  describe('exemple complet du guide IS.md', () => {
    it('reproduit exactement l\'exemple du document', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 1_950_000,
        acomptes_payes: 700_000,
        minimum_perception: 1_200_000, // max(16 000, 3 % de 40M = 1 200 000)
      })
      expect(result.CA_arrondi).toBe(40_000_000)
      expect(result.IS_brut).toBe(2_000_000)
      expect(result.reduction).toBe(39_000)
      expect(result.IS_apres_charges).toBe(1_961_000)
      expect(result.IS_minimum).toBe(1_961_000) // 1 961 000 > 1 200 000
      expect(result.IS_solde).toBe(1_261_000)
      expect(result.acompte_N).toBe(2_000_000)
      expect(result.total_a_payer).toBe(3_261_000)
    })
  })
})
