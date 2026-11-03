export function brandsFor(exercise){return [...new Set([...(exercise.machine_references||[]).map(r=>r.brand),exercise.machine_brand].filter(Boolean))];}
export function machineSearchText(exercise){return (exercise.machine_references||[]).map(r=>`${r.brand} ${r.series} ${r.model}`).join(' ');}
