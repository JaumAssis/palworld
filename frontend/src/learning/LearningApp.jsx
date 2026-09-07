import { Routes, Route, useParams } from 'react-router-dom'
import LearningCatalog from './LearningCatalog'
import LearningHome from './LearningHome'
import LearningLesson from './LearningLesson'

// Roteamento interno do /learning — o App.jsx do jogo só monta <Route path="/learning/*"
// element={<LearningApp />} />; rotas novas aqui dentro não exigem tocar em arquivo do jogo.
// /learning é o catálogo de cursos (só Python por enquanto, mais virão); cada curso mora na sua
// própria subrota — /learning/python é a trilha de Python.
export default function LearningApp() {
  return (
    <Routes>
      <Route path="/" element={<LearningCatalog />} />
      <Route path="/python" element={<LearningHome />} />
      <Route path="/python/:lessonId" element={<LearningLessonRoute />} />
    </Routes>
  )
}

// key={lessonId} força remontagem ao navegar para a próxima lição (ex: botão "Próxima lição") —
// LearningLesson reinicia do zero (useState nos valores iniciais) sem precisar de nenhum reset
// manual de estado dentro de um efeito.
function LearningLessonRoute() {
  const { lessonId } = useParams()
  return <LearningLesson key={lessonId} />
}
