export type ISInput = {
  CA: number
  charges_eligibles: number
  acomptes_payes: number
  minimum_perception: number
  acompte_N?: number
}

export type ISResult = {
  CA_arrondi: number
  IS_brut: number
  reduction: number
  IS_apres_charges: number
  IS_minimum: number
  IS_solde: number
  acompte_N: number
  total_a_payer: number
}

export function calculerIS(input: ISInput): ISResult {
  const { CA, charges_eligibles, acomptes_payes, minimum_perception } = input

  const CA_arrondi = Math.floor(CA / 10_000) * 10_000
  const IS_brut = CA_arrondi * 0.05
  const reduction = charges_eligibles * 0.02
  const IS_apres_charges = IS_brut - reduction

  // Le minimum légal s'applique uniquement quand les acomptes couvrent déjà l'IS
  // (situation de crédit) : IS_apres_charges - acomptes_payes <= 0
  const IS_net = IS_apres_charges - acomptes_payes
  const is_credit = IS_net <= 0

  const IS_minimum = IS_apres_charges
  const IS_solde = is_credit ? minimum_perception : IS_net
  const acompte_N = input.acompte_N ?? CA_arrondi * 0.05
  const total_a_payer = is_credit ? IS_solde : IS_solde + acompte_N

  return {
    CA_arrondi,
    IS_brut,
    reduction,
    IS_apres_charges,
    IS_minimum,
    IS_solde,
    acompte_N,
    total_a_payer,
  }
}
