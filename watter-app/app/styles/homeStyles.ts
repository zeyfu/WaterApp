import { StyleSheet } from "react-native";
import { COLORS } from "../../src/styles/theme";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },

  // CARD PRINCIPAL (COPO E PROGRESSO)
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 35,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    marginTop: 10,
    marginBottom: 20,
  },
  glassHeader: { alignItems: "center", marginBottom: 20 },

  // BADGE DE TEMPERATURA
  tempBadge: {
    backgroundColor: "rgba(255,255,255,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  tempText: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },

  // ESTATÍSTICAS (META, HOJE, FOCO)
  integratedStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 20,
    paddingBottom: 15,
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.secondary, fontWeight: "600" },
  vDivider: { width: 1, height: 25, backgroundColor: "rgba(255,255,255,0.3)" },

  // BARRA DE PROGRESSO E TEXTO
  integratedProgress: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  progressStatus: {
    textAlign: "center",
    color: COLORS.primary,
    fontWeight: "700",
    marginTop: 8,
    fontSize: 13,
  },

  // SEÇÃO DE HISTÓRICO
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  historyContainer: {
    marginTop: 5,
    paddingBottom: 20,
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B7D0F5",
  },
});
