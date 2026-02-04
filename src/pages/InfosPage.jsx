// src/pages/InfosPage.jsx (PAGE 7 - Infos & Conformité)
import { useState } from 'react'
import {
  Shield,
  Users,
  FileText,
  Code,
  GraduationCap,
  CheckCircle,
  XCircle,
} from 'lucide-react'

const TABS = [
  { name: '🔒 RGPD & Éthique', icon: Shield, id: 'rgpd' },
  { name: '🎓 Contexte Projet', icon: GraduationCap, id: 'contexte' },
  { name: '👥 Équipe', icon: Users, id: 'equipe' },
  { name: '⚙ Architecture', icon: Code, id: 'architecture' },
]

const RGPD_NOT = [
  'Aucune donnée réelle de patients',
  'Aucune donnée identifiable (NIR, nom, prénom)',
  'Aucune donnée clinique réelle (diagnostics, traitements)',
  'Aucun accès à des bases de données hospitalières réelles',
  'Aucun stockage permanent de données',
]

const RGPD_YES = [
  'Données 100 % générées artificiellement par algorithme',
  'Aucune connexion à des systèmes hospitaliers réels',
  'Données éphémères (regénérées à chaque lancement)',
  "Mention 'DONNÉES FICTIVES' visible sur tous les écrans",
  'Documentation complète de la méthodologie de génération',
]

const DOCS = [
  {
    title: "Fiche d'impact RGPD",
    description:
      'Analyse des risques liés au traitement de données de santé',
    icon: FileText,
  },
  {
    title: 'Méthodologie de génération',
    description:
      'Algorithme de création de données synthétiques et validation',
    icon: Code,
  },
  {
    title: 'Charte éthique',
    description:
      "Engagements de l'équipe projet et limites d'utilisation",
    icon: Shield,
  },
]

export default function InfosPage() {
  const [activeTab, setActiveTab] = useState('rgpd')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ℹ Informations & Conformité RGPD
        </h1>
        <p className="text-gray-500 mt-1">
          Documentation complète du projet — Conformité stricte aux exigences
          RGPD
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rgpd' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Shield className="w-6 h-6 text-blue-600 mr-2" />
                  Conformité RGPD — Données de santé
                </h2>
                <p className="mt-2 text-gray-600">
                  Ce dashboard respecte strictement le Règlement Général sur la
                  Protection des Données (RGPD) et les dispositions spécifiques
                  aux données de santé (article L.1110-4 du CSP).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="font-semibold text-red-800 flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    Ce que ce projet NE CONTIENT PAS
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {RGPD_NOT.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-red-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-semibold text-green-800 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Ce que ce projet CONTIENT
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {RGPD_YES.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-green-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">
                  Engagement éthique
                </h3>
                <blockquote className="text-blue-900 italic border-l-4 border-blue-400 pl-4 py-2 bg-white rounded-r-lg">
                  « Ce dashboard est un prototype pédagogique développé dans le
                  cadre du Master DATA 2026. Il ne doit en aucun cas être
                  utilisé pour prendre des décisions cliniques réelles ou
                  piloter un établissement de santé sans validation par des
                  professionnels de santé et conformité aux réglementations en
                  vigueur. »
                </blockquote>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Documentation RGPD complète
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {DOCS.map((doc, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600">
                        <doc.icon className="w-6 h-6" />
                      </div>
                      <h4 className="mt-4 font-medium text-gray-900">
                        {doc.title}
                      </h4>
                      <p className="mt-2 text-sm text-gray-600">
                        {doc.description}
                      </p>
                      <button
                        type="button"
                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Télécharger (PDF) →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contexte' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                Contexte du projet
              </h2>
              <p className="text-gray-600">
                Projet DATA 2026 — Master Data. Ce tableau de bord simule un
                pilotage hospitalier à partir de données entièrement fictives,
                dans un objectif pédagogique et de démonstration.
              </p>
            </div>
          )}

          {activeTab === 'equipe' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Équipe</h2>
              <p className="text-gray-600">
                Équipe projet Master DATA 2026 — Hôpital Pitié-Salpêtrière
                (AP-HP). Prototype à usage pédagogique uniquement.
              </p>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Architecture</h2>
              <p className="text-gray-600">
                Application React (Vite), données générées côté client par
                DataGenerator. Aucune API ni base de données réelle.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer explicatif */}
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              À l&apos;attention du jury et des parties prenantes
            </h3>
            <p className="mt-2 text-sm text-red-700">
              Toutes les données présentées dans cette démonstration sont{' '}
              <span className="font-medium">artificiellement générées</span> et
              ne représentent{' '}
              <span className="font-medium">aucune situation réelle</span> de
              l&apos;hôpital de la Pitié-Salpêtrière.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
