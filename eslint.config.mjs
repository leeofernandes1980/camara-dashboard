import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // O padrão de fetch-em-useEffect usado nos hooks de dados (useDeputados,
      // useProposicoes, useVotacoes) sempre seta loading/erro de forma síncrona
      // no início do efeito. Rebaixado para warning até uma eventual migração
      // para uma lib de data-fetching (SWR/TanStack Query).
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
