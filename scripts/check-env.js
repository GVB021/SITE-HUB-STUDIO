// Verificação de ambiente para deploy no Railway
// Executado antes do start do servidor

console.log("🔍 Verificando ambiente para deploy no Railway...");

const requiredVars = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "DAILY_API_KEY"
];

const missing = requiredVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error("❌ ERRO CRÍTICO: Variáveis de ambiente faltando!");
  console.error("As seguintes variáveis são obrigatórias e não foram encontradas:");
  missing.forEach(key => console.error(`   - ${key}`));
  console.error("\nPor favor, configure-as no painel do Railway (Variables).");
  process.exit(1);
}

// Verificar Supabase (Opcional mas recomendado)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ AVISO: Configuração do Supabase incompleta.");
  console.warn("Uploads de áudio e takes podem não funcionar corretamente.");
}

console.log("✅ Variáveis de ambiente críticas validadas com sucesso.");
