UPDATE "Indicator" SET "unit" = '%' WHERE "code" IN ('COM-001', 'COM-003', 'FIN-003', 'OPE-001', 'RET-002', 'RET-003');
UPDATE "Indicator" SET "unit" = 'R$' WHERE "code" IN ('COM-002', 'FIN-001', 'FIN-002', 'RET-001');
UPDATE "Indicator" SET "unit" = 'minutos' WHERE "code" = 'OPE-002';
UPDATE "Indicator" SET "unit" = 'pacientes por turno' WHERE "code" = 'OPE-003';
