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

  describe('IS_minimum = IS_apres_charges (sans minimum légal)', () => {
    it('IS_minimum égale IS_apres_charges', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 0,
        minimum_perception: 320_000,
      })
      expect(result.IS_minimum).toBe(2_000_000)
    })
  })

  describe('minimum légal : appliqué uniquement en situation de crédit', () => {
    it('situation crédit (acomptes >= IS_brut) → IS_solde = minimum_perception', () => {
      // Case 1 : CA=4 775 000, IS_brut=238 500, acomptes=305 000 > IS_brut → crédit
      const result = calculerIS({
        CA: 4_775_000,
        charges_eligibles: 0,
        acomptes_payes: 305_000,
        minimum_perception: 320_000,
      })
      expect(result.IS_solde).toBe(320_000)
      expect(result.total_a_payer).toBe(320_000) // pas d'acompte_N ajouté
    })

    it('situation déficit (acomptes < IS_brut) → IS_solde = IS_brut − acomptes, minimum non appliqué', () => {
      // Case 3 : CA=6 100 000, IS_brut=305 000, acomptes=150 000 < IS_brut → déficit
      const result = calculerIS({
        CA: 6_100_000,
        charges_eligibles: 0,
        acomptes_payes: 150_000,
        minimum_perception: 320_000,
      })
      expect(result.IS_solde).toBe(155_000) // 305 000 − 150 000
      expect(result.acompte_N).toBe(305_000) // CA × 5%
      expect(result.total_a_payer).toBe(460_000) // 155 000 + 305 000
    })

    it('situation déficit avec IS_brut > minimum → comportement normal', () => {
      // Case 2 : CA=8 100 000, IS_brut=405 000 > minimum=320 000, acomptes=320 000
      const result = calculerIS({
        CA: 8_100_000,
        charges_eligibles: 0,
        acomptes_payes: 320_000,
        minimum_perception: 320_000,
      })
      expect(result.IS_solde).toBe(85_000)
      expect(result.acompte_N).toBe(405_000)
      expect(result.total_a_payer).toBe(490_000)
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

    it('applique le minimum en situation de crédit', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 5_000_000,
        minimum_perception: 16_000,
      })
      // IS_brut=2M, acomptes=5M > IS_brut → crédit → IS_solde = minimum = 16 000
      expect(result.IS_solde).toBe(16_000)
      expect(result.total_a_payer).toBe(16_000)
    })
  })

  describe('acompte pour l\'année N (CA × 5 %)', () => {
    it('calcule 5 % du CA arrondi comme acompte N en situation de déficit', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 500_000,
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
    it('déficit : IS_solde + acompte_N', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 500_000,
        minimum_perception: 16_000,
      })
      // IS_brut=2M, IS_solde=1.5M, acompte_N=2M → total=3.5M
      expect(result.total_a_payer).toBe(3_500_000)
    })

    it('crédit : total = minimum_perception uniquement', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 0,
        acomptes_payes: 5_000_000,
        minimum_perception: 16_000,
      })
      // IS_brut=2M < acomptes=5M → crédit → total = minimum = 16 000
      expect(result.total_a_payer).toBe(16_000)
    })
  })

  describe('exemple complet du guide IS.md', () => {
    it('reproduit exactement l\'exemple du document', () => {
      const result = calculerIS({
        CA: 40_000_000,
        charges_eligibles: 1_950_000,
        acomptes_payes: 700_000,
        minimum_perception: 1_200_000,
      })
      expect(result.CA_arrondi).toBe(40_000_000)
      expect(result.IS_brut).toBe(2_000_000)
      expect(result.reduction).toBe(39_000)
      expect(result.IS_apres_charges).toBe(1_961_000)
      expect(result.IS_minimum).toBe(1_961_000)
      expect(result.IS_solde).toBe(1_261_000) // 1_961_000 - 700_000 (déficit)
      expect(result.acompte_N).toBe(2_000_000)
      expect(result.total_a_payer).toBe(3_261_000)
    })
  })
})
