import { areas, frequencies, indicatorLevels, indicatorTypes, perspectives, polarities, statuses } from "@/lib/constants";

type Option = readonly [string, string];

export function SelectField({ label, name, options, defaultValue, required = true }: { label: string; name: string; options: readonly Option[]; defaultValue?: string | null; required?: boolean }) {
  return (
    <label>
      {label}
      <select className="select" name={name} defaultValue={defaultValue ?? ""} required={required}>
        {!required && <option value="">Todos</option>}
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TextField({ label, name, defaultValue, required = true, type = "text", placeholder }: { label: string; name: string; defaultValue?: string | number | null; required?: boolean; type?: string; placeholder?: string }) {
  return (
    <label>
      {label}
      <input className="input" name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} />
    </label>
  );
}

export function TextAreaField({ label, name, defaultValue, required = true }: { label: string; name: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <label>
      {label}
      <textarea className="textarea" name={name} defaultValue={defaultValue ?? ""} required={required} />
    </label>
  );
}

export function CheckboxField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="check-row">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

export function IndicatorForm({ action, indicator }: { action: (formData: FormData) => void; indicator?: any }) {
  return (
    <form action={action} className="card form">
      <div className="grid grid-3">
        <TextField label="Código" name="code" defaultValue={indicator?.code} placeholder="FIN-002" />
        <TextField label="Nome" name="name" defaultValue={indicator?.name} />
        <SelectField label="Área" name="area" options={areas} defaultValue={indicator?.area} />
      </div>
      <div className="grid grid-3">
        <SelectField label="Perspectiva BSC" name="bscPerspective" options={perspectives} defaultValue={indicator?.bscPerspective} />
        <SelectField label="Tipo" name="type" options={indicatorTypes} defaultValue={indicator?.type} />
        <SelectField label="Nível" name="level" options={indicatorLevels} defaultValue={indicator?.level} />
      </div>
      <div className="grid grid-3">
        <SelectField label="Polaridade" name="polarity" options={polarities} defaultValue={indicator?.polarity} />
        <TextField label="Unidade" name="unit" defaultValue={indicator?.unit} placeholder="%, R$, dias..." />
        <SelectField label="Status" name="status" options={statuses} defaultValue={indicator?.status ?? "ATIVO"} />
      </div>
      <div className="grid grid-3">
        <TextField label="Responsável primário" name="responsiblePrimary" defaultValue="Coordenação Administrativa" />
        <TextField label="Responsável secundário" name="responsibleSecondary" defaultValue={indicator?.responsibleSecondary} required={false} />
        <TextField label="Responsável pela coleta" name="collectionOwner" defaultValue="Coordenação Administrativa" />
      </div>
      <div className="grid grid-2">
        <SelectField label="Frequência de coleta" name="collectionFrequency" options={frequencies} defaultValue={indicator?.collectionFrequency ?? "MENSAL"} />
        <SelectField label="Frequência de análise" name="analysisFrequency" options={frequencies} defaultValue={indicator?.analysisFrequency ?? "MENSAL"} />
      </div>
      <TextAreaField label="Objetivo estratégico" name="strategicObjective" defaultValue={indicator?.strategicObjective} />
      <TextAreaField label="Finalidade" name="purpose" defaultValue={indicator?.purpose} />
      <TextAreaField label="Definição operacional" name="operationalDefinition" defaultValue={indicator?.operationalDefinition} />
      <TextAreaField label="Fórmula" name="formula" defaultValue={indicator?.formula} />
      <div className="grid grid-3">
        <TextField label="Sistema de origem" name="sourceSystem" defaultValue={indicator?.sourceSystem} />
        <TextField label="Método de coleta" name="collectionMethod" defaultValue={indicator?.collectionMethod} />
        <TextField label="Local de armazenamento" name="storageLocation" defaultValue={indicator?.storageLocation} required={false} />
      </div>
      <div className="grid grid-2">
        <TextAreaField label="Relevância" name="relevance" defaultValue={indicator?.relevance} required={false} />
        <TextAreaField label="Limitações" name="limitations" defaultValue={indicator?.limitations} required={false} />
      </div>
      <div className="grid grid-3">
        <TextField label="Projeto vinculado" name="linkedProject" defaultValue={indicator?.linkedProject} required={false} />
        <TextField label="Meta organizacional" name="organizationalGoal" defaultValue={indicator?.organizationalGoal} required={false} />
        <TextField label="Dashboard" name="dashboardName" defaultValue={indicator?.dashboardName} required={false} />
      </div>
      <div className="grid grid-3">
        <TextField label="Numerador" name="numerator" defaultValue={indicator?.numerator} required={false} />
        <TextField label="Denominador" name="denominator" defaultValue={indicator?.denominator} required={false} />
        <TextField label="Evidência" name="evidence" defaultValue={indicator?.evidence} required={false} />
      </div>
      <div className="grid grid-2">
        <TextAreaField label="Critérios de inclusão" name="inclusionCriteria" defaultValue={indicator?.inclusionCriteria} required={false} />
        <TextAreaField label="Critérios de exclusão" name="exclusionCriteria" defaultValue={indicator?.exclusionCriteria} required={false} />
      </div>
      <div className="grid grid-3">
        <TextField label="Agente IA" name="aiAgentName" defaultValue={indicator?.aiAgentName} required={false} />
        <TextField label="Confiabilidade dos dados" name="dataReliability" defaultValue={indicator?.dataReliability ?? "Médio"} />
        <SelectField label="Frequência de auditoria" name="auditFrequency" options={frequencies} defaultValue={indicator?.auditFrequency ?? "TRIMESTRAL"} required={false} />
      </div>
      <div className="inline-actions">
        <CheckboxField label="Elegível para IA" name="isAiEligible" defaultChecked={indicator?.isAiEligible} />
        <CheckboxField label="Fonte integrável por IA" name="isAiIntegrable" defaultChecked={indicator?.isAiIntegrable} />
        <CheckboxField label="Exige auditoria" name="requiresAudit" defaultChecked={indicator?.requiresAudit ?? true} />
      </div>
      <button className="button" type="submit">Salvar</button>
    </form>
  );
}
