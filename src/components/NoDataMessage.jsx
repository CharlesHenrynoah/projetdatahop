export default function NoDataMessage() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
      <p className="text-amber-800 font-medium">
        Aucune donnée chargée — pas de données fictives
      </p>
      <p className="mt-2 text-sm text-amber-700">
        Pour afficher les données : exécutez le notebook <strong>Untitled10 (1).ipynb</strong> jusqu’à
        la cellule « Export des données pour les pages du logiciel », puis rechargez cette page.
        Le fichier <code className="bg-amber-100 px-1 rounded">public/hospital_data.json</code> doit exister.
      </p>
    </div>
  )
}
