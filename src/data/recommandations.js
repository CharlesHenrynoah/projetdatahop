/** Données fictives pour les écrans Recommandations & Décisions */

export const ETATS_RECOM = {
  NOUVELLE: 'nouvelle',
  VUE: 'vue',
  APPLIQUEE: 'appliquee',
  REPORTEE: 'reportee',
  IGNOREE: 'ignoree',
}

export const TYPES_RECOM = {
  RH: 'rh',
  LITS: 'lits',
  STOCKS: 'stocks',
}

export const PRIORITES = {
  CRITIQUE: 'critique',
  HAUTE: 'haute',
  MOYENNE: 'moyenne',
  BASSE: 'basse',
}

export const LABELS_PRIORITE = {
  [PRIORITES.CRITIQUE]: 'Critique',
  [PRIORITES.HAUTE]: 'Haute',
  [PRIORITES.MOYENNE]: 'Moyenne',
  [PRIORITES.BASSE]: 'Basse',
}

export const LABELS_ETAT = {
  [ETATS_RECOM.NOUVELLE]: 'Nouvelle',
  [ETATS_RECOM.VUE]: 'Vue',
  [ETATS_RECOM.APPLIQUEE]: 'Appliquée',
  [ETATS_RECOM.REPORTEE]: 'Reportée',
  [ETATS_RECOM.IGNOREE]: 'Ignorée',
}

export const LABELS_TYPE = {
  [TYPES_RECOM.RH]: 'RH',
  [TYPES_RECOM.LITS]: 'Lits',
  [TYPES_RECOM.STOCKS]: 'Stocks',
}

export const REGLES_MOCK = [
  {
    id: 'r1',
    nom: 'Occupation médecine > 85 %',
    active: true,
    condition: { type: 'occupation', operateur: '>', seuil: 85, unite: '%' },
    contexte: { typeJour: 'semaine', scope: 'Medecine interne' },
    action: { type: 'lits', libelle: 'Ouvrir lits' },
  },
  {
    id: 'r2',
    nom: 'Stock critique < seuil',
    active: true,
    condition: { type: 'stock', operateur: '<', seuil: 5, unite: 'unités' },
    contexte: { typeJour: 'tous', scope: 'Global' },
    action: { type: 'stocks', libelle: 'Alerte stocks' },
  },
  {
    id: 'r3',
    nom: 'Tension RH urgences',
    active: false,
    condition: { type: 'rh', operateur: '<', seuil: 70, unite: '%' },
    contexte: { typeJour: 'tous', scope: 'Urgences' },
    action: { type: 'rh', libelle: 'Redéploiement RH' },
  },
]

/** Options pour les formulaires (création recommandation, etc.) */
export const SERVICES_OPTIONS = [
  'Médecine interne',
  'Urgences',
  'Pharmacie',
  'Imagerie',
  'Réanimation',
  'Bloc opératoire',
  'Global',
]

export const ACTIONS_PROPOSEES_OPTIONS = [
  'Ouvrir 10 lits en médecine interne',
  'Ouvrir 15 lits en médecine interne',
  'Déplacer 3 soignants du service A vers Urgences',
  'Déplacer 5 soignants vers Urgences',
  'Alerte stock critique — médicament X',
  'Alerte stocks — réapprovisionnement',
  'Redéploiement RH vers service saturé',
  'Ouverture lits supplémentaires',
  'Renfort personnel de nuit',
]

export const DECLENCHEURS_OPTIONS = [
  "Déclenché car taux d'occupation > 92 % depuis 4 h",
  "Déclenché car taux de couverture RH < 70 % depuis 2 h",
  'Déclenché car stock < 5 unités (seuil critique)',
  'Déclenché car occupation > 85 %',
  'Déclenché car tension RH prolongée',
  'Seuil critique dépassé depuis plus de 2 h',
]

export const DONNEES_SOURCES_OPTIONS = [
  'Occupation actuelle : 88 %',
  'Occupation actuelle : 92 %',
  'Taux couverture : 65 %',
  'Stock actuel : 3 unités',
  'Données temps réel flux',
  'Indicateurs hebdomadaires',
]

export const SEUILS_FRANCHIS_OPTIONS = [
  'Seuil 85 % dépassé',
  'Seuil 70 % non atteint',
  'Seuil minimum 5 unités',
  'Seuil critique atteint',
  'Seuil d\'alerte dépassé',
]

export const IMPACT_OCCUPATION_OPTIONS = [
  '+4 % de capacité',
  'Stable',
  '—',
  'Augmentation capacité lits',
  'Réduction saturation',
]

export const IMPACT_DELAIS_OPTIONS = [
  "Réduction file d'attente",
  "Amélioration temps de prise en charge",
  "Risque rupture sous 48 h",
  '—',
  'Délais maintenus',
]

export const IMPACT_CHARGE_RH_OPTIONS = [
  'Stable',
  '+3 ETP sur Urgences',
  '—',
  'Légère hausse',
  'Redéploiement interne',
]

export const RECOMMANDATIONS_MOCK = [
  {
    id: 'rec1',
    type: TYPES_RECOM.LITS,
    priorite: PRIORITES.CRITIQUE,
    etat: ETATS_RECOM.NOUVELLE,
    service: 'Médecine interne',
    actionProposee: 'Ouvrir 10 lits en médecine interne',
    declencheur: 'Déclenché car taux d\'occupation > 92 % depuis 4 h',
    justification: {
      reglesDeclenchees: ['Occupation médecine > 85 %'],
      donneesSources: 'Occupation actuelle : 88 %',
      seuilsFranchis: 'Seuil 85 % dépassé',
    },
    impactEstime: {
      occupation: '+4 % de capacité',
      delaisPatients: 'Réduction file d\'attente',
      chargeRH: 'Stable',
    },
    regleId: 'r1',
  },
  {
    id: 'rec2',
    type: TYPES_RECOM.RH,
    priorite: PRIORITES.HAUTE,
    etat: ETATS_RECOM.VUE,
    service: 'Urgences',
    actionProposee: 'Déplacer 3 soignants du service A vers Urgences',
    declencheur: 'Déclenché car taux de couverture RH < 70 % depuis 2 h',
    justification: {
      reglesDeclenchees: ['Tension RH urgences'],
      donneesSources: 'Taux couverture : 65 %',
      seuilsFranchis: 'Seuil 70 % non atteint',
    },
    impactEstime: {
      occupation: '—',
      delaisPatients: 'Amélioration temps de prise en charge',
      chargeRH: '+3 ETP sur Urgences',
    },
    regleId: 'r3',
  },
  {
    id: 'rec3',
    type: TYPES_RECOM.STOCKS,
    priorite: PRIORITES.MOYENNE,
    etat: ETATS_RECOM.NOUVELLE,
    service: 'Pharmacie',
    actionProposee: 'Alerte stock critique — médicament X',
    declencheur: 'Déclenché car stock < 5 unités (seuil critique)',
    justification: {
      reglesDeclenchees: ['Stock critique < seuil'],
      donneesSources: 'Stock actuel : 3 unités',
      seuilsFranchis: 'Seuil minimum 5 unités',
    },
    impactEstime: {
      occupation: '—',
      delaisPatients: 'Risque rupture sous 48 h',
      chargeRH: '—',
    },
    regleId: 'r2',
  },
]
