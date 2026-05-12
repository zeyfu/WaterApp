# 💧 Beba+ — Water Tracker App

> **A hidratação inteligente na palma da sua mão.**
> Uma aplicação mobile de alta performance desenvolvida para auxiliar usuários no controle diário de ingestão de água, integrando tecnologia de geolocalização e dados climáticos em tempo real.

---

## 📱 Sobre o Projeto

O **Beba+** não é apenas um contador de água. É um assistente de saúde desenvolvido com **TypeScript** e **React Native** para oferecer uma experiência fluida e intuitiva. O diferencial do app é o seu **Ajuste Dinâmico**: ele identifica sua localização e ajusta sua meta de hidratação automaticamente conforme a temperatura local, garantindo que seu corpo receba o volume ideal de líquidos em dias de calor intenso.

---

## ✨ Funcionalidades Principais

* 🔐 Autenticação Segura: Login e cadastro de usuários via Firebase Authentication.
* 📍 Geolocalização Real-time: Identificação automática da posição (GPS) para consulta climática (Otimizado para Mobile).
* 🔥 Sistema de Streak & Recordes: Gamificação que rastreia dias consecutivos de meta batida e armazena seu recorde pessoal (Best Streak) no Firestore.
* 🌡️ Meta Dinâmica Inteligente: Cálculo baseado em peso (Peso x 35ml) com acréscimos automáticos baseados na temperatura.
* 💎 Design Glassmorphism: Interface unificada com "Hero Card", transparências modernas e visual limpo (Clean UI).
* 📉 Histórico Interativo: Sistema de Dropout (Accordion) para organizar os logs sem poluir a interface principal.
* 📊 Feedback Visual: Barra de progresso integrada e componente de copo d'água dinâmico.

---

## 🌡️ Ajuste Inteligente de Meta

O app consome a API Open-Meteo para aplicar regras de negócio baseadas no clima da sua região:

| Temperatura | Ajuste na Meta |
| :--- | :--- |
| >= 35°C (Calor Extremo) | +1000 ml |
| >= 30°C (Calor Intenso) | +700 ml |
| >= 25°C (Calor Moderado) | +400 ml |
| < 25°C (Clima Ameno) | Meta Padrão |

---

## 🛠️ Stack Tecnológica

* Linguagem: TypeScript
* Framework: React Native com Expo
* Navegação: Expo Router (File-based routing)
* Backend: Firebase (Auth & Firestore NoSQL)
* Localização: Expo Location API
* Arquitetura: Custom Hooks para gerenciamento de estado global (useWaterData)

---

## 🗄️ Estrutura de Dados (Firestore)

### Collection: users
{
  "email": "usuario@exemplo.com",
  "weight": 75,
  "age": 25,
  "gender": "Masculino",
  "goal": 2625,
  "bestStreak": 15
}

---

## ⚙️ Como Executar o Projeto

1. Clonar o repositório:
   git clone https://github.com/zeyfu/WaterApp.git

2. Instalar dependências:
   npm install

3. Configurar Firebase:
   Crie o arquivo src/services/firebaseConfig.ts e insira suas credenciais do Firebase.

4. Inicie o ambiente:
   npx expo start

---

## 📌 Status do Projeto

* ✅ Geolocalização funcional (Mobile)
* ✅ Interface Unificada (Hero Card) & Glassmorphism
* ✅ Autenticação & Persistência de Dados
* ✅ Lógica de Streak & Recorde Pessoal
* ✅ Histórico Interativo (Dropout)
* 🚧 Em desenvolvimento: Notificações Locais Dinâmicas e Gráficos de Consumo Semanal.

---

## 👨‍💻 Autores

* Henrique Kempim — GitHub: https://github.com/Zeyfu  
* Guilherme Andrade — GitHub:

---

Desenvolvido para fins acadêmicos com foco em alta performance e UX (User Experience).
