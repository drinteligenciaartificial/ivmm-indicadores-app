export function calculateAchievement(actual:number,target:number,polarity:"MAIOR_MELHOR"|"MENOR_MELHOR"){ if(!target||!actual)return 0; return polarity==="MAIOR_MELHOR" ? actual/target*100 : target/actual*100; }
export function getTrafficLight(a:number){ return a>=100?"VERDE":a>=80?"AMARELO":"VERMELHO"; }
export function formatArea(a:string){ return ({FINANCEIRO:"Financeiro",COMERCIAL:"Comercial",RH:"RH",OPERACOES:"Operações",MARKETING:"Marketing",ADMINISTRATIVO:"Administrativo"} as Record<string,string>)[a]??a; }
export function formatPerspective(p:string){ return ({FINANCEIRA:"Financeira",CLIENTES:"Clientes",PROCESSOS_INTERNOS:"Processos Internos",PESSOAS_E_CULTURA:"Pessoas e Cultura"} as Record<string,string>)[p]??p; }
