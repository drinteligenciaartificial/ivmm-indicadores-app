import { PrismaClient, Area, BscPerspective, IndicatorType, IndicatorLevel, Polarity, Frequency, TrafficLight } from "@prisma/client";
const prisma = new PrismaClient();
function achievement(actual:number,target:number,polarity:Polarity){ if(!target||!actual)return 0; return polarity==='MAIOR_MELHOR' ? actual/target*100 : target/actual*100; }
function light(a:number):TrafficLight{ return a>=100?'VERDE':a>=80?'AMARELO':'VERMELHO'; }
async function main(){
 await prisma.result.deleteMany(); await prisma.goal.deleteMany(); await prisma.okrIndicator.deleteMany(); await prisma.okr.deleteMany(); await prisma.indicator.deleteMany();
 const data=[
  ['FIN-001','Receita Mensal',Area.FINANCEIRO,BscPerspective.FINANCEIRA,'Aumentar sustentabilidade financeira',IndicatorType.EFICACIA,IndicatorLevel.ESTRATEGICO,Polarity.MAIOR_MELHOR,'R$',250000,230000,false,false],
  ['COM-001','Taxa de Conversão de Leads',Area.COMERCIAL,BscPerspective.CLIENTES,'Melhorar conversão comercial',IndicatorType.EFICACIA,IndicatorLevel.TATICO,Polarity.MAIOR_MELHOR,'%',35,31,false,false],
  ['OPE-001','Tempo Médio de Resposta ao Paciente',Area.OPERACOES,BscPerspective.PROCESSOS_INTERNOS,'Reduzir gargalos no fluxo do paciente',IndicatorType.EFICIENCIA,IndicatorLevel.OPERACIONAL,Polarity.MENOR_MELHOR,'min',10,13,false,false],
  ['RH-001','Treinamentos Realizados no Mês',Area.RH,BscPerspective.PESSOAS_E_CULTURA,'Desenvolver cultura de melhoria contínua',IndicatorType.QUALIDADE,IndicatorLevel.TATICO,Polarity.MAIOR_MELHOR,'qtde',4,4,false,false],
  ['IA-001','Percentual de Indicadores Automatizados',Area.OPERACOES,BscPerspective.PROCESSOS_INTERNOS,'Implantar governança de dados e IA',IndicatorType.EFICIENCIA,IndicatorLevel.ESTRATEGICO,Polarity.MAIOR_MELHOR,'%',40,18,true,true]
 ] as const;
 const created=[];
 for(const [code,name,area,bsc,objective,type,level,polarity,unit,target,actual,ai,integrable] of data){
  const a=achievement(actual,target,polarity); const ind=await prisma.indicator.create({data:{code,name,area,responsiblePrimary:'Coordenação Administrativa',bscPerspective:bsc,strategicObjective:objective,type,level,polarity,unit,purpose:`Monitorar ${name}.`,operationalDefinition:`Indicador ${code} da gestão IVMM.`,formula:'Resultado apurado conforme ficha técnica.',sourceSystem:'Planilha / CRM / Sistema interno',collectionMethod:'Manual com possibilidade de automação',collectionOwner:'Coordenação Administrativa',isAiEligible:ai,isAiIntegrable:integrable,dashboardName:'Dashboard Executivo IVMM',aiAgentName: ai?'Agente IVMM Indicadores':null,auditFrequency:Frequency.TRIMESTRAL}});
  created.push(ind);
  await prisma.goal.create({data:{indicatorId:ind.id,year:2026,quarter:2,month:6,targetValue:target,alertValue:target*0.8,minimumValue:target*0.7,idealValue:target*1.1}});
  await prisma.result.create({data:{indicatorId:ind.id,referenceDate:new Date('2026-06-01'),actualValue:actual,targetValue:target,achievement:a,trafficLight:light(a),analysis:'Resultado inicial de demonstração.',actionPlan:a<100?'Abrir plano de ação com responsável e prazo.':'Manter rotina e acompanhar tendência.'}});
 }
 const okr=await prisma.okr.create({data:{title:'OKR 2026 - Gestão por Indicadores',objective:'Transformar o IVMM em organização orientada por dados.',area:Area.OPERACOES,year:2026,quarter:2,owner:'Head de Operações'}});
 for(const ind of created) await prisma.okrIndicator.create({data:{okrId:okr.id,indicatorId:ind.id,weight:1}});
}
main().finally(()=>prisma.$disconnect());
