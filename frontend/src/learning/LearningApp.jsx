import { Routes, Route, useParams } from 'react-router-dom'
import LearningLanding from './LearningLanding'
import LearningCatalog from './LearningCatalog'
import LearningHome from './LearningHome'
import LearningLesson from './LearningLesson'

// Roteamento interno do /learning — o App.jsx do jogo só monta <Route path="/learning/*"
// element={<LearningApp />} />; rotas novas aqui dentro não exigem tocar em arquivo do jogo.
// /learning é a tela inicial (2 quadrados: Catálogo e Minigames); /learning/catalogo é a lista de
// cursos disponíveis; cada curso mora na sua própria subrota genérica /learning/:courseId (ex:
// /learning/python, /learning/logica) — LearningHome/LearningLesson leem o courseId da URL e
// chamam a API com ?course=<courseId>, sem nada específico de curso no código. React Router dá
// prioridade a rotas estáticas (/catalogo) sobre a dinâmica (/:courseId) independente da ordem
// declarada aqui, mas a ordem abaixo já segue essa prioridade por clareza.
export default function LearningApp() {
  return (
    <Routes>
      <Route path="/" element={<LearningLanding />} />
      <Route path="/catalogo" element={<LearningCatalog />} />
      <Route path="/:courseId" element={<LearningHomeRoute />} />
      <Route path="/:courseId/:lessonId" element={<LearningLessonRoute />} />
    </Routes>
  )
}

// key={courseId} força remontagem ao trocar de curso (ex: catálogo -> voltar -> outro curso),
// resetando o estado do zero sem precisar de reset manual dentro de um efeito.
function LearningHomeRoute() {
  const { courseId } = useParams()
  return <LearningHome key={courseId} courseId={courseId} />
}

// key={lessonId} força remontagem ao navegar para a próxima lição (ex: botão "Próxima lição") —
// LearningLesson reinicia do zero (useState nos valores iniciais) sem precisar de nenhum reset
// manual de estado dentro de um efeito.
function LearningLessonRoute() {
  const { courseId, lessonId } = useParams()
  return <LearningLesson key={lessonId} courseId={courseId} />
}
