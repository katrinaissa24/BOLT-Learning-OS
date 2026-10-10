import { Puzzle } from 'lucide-react'
import { EmptyState } from '../ui'
import CircleRings from './math/CircleRings'
import TangentExplorer from './math/TangentExplorer'
import PowerRuleSquare from './math/PowerRuleSquare'
import ProductRuleBox from './math/ProductRuleBox'
import LimitExplorer from './math/LimitExplorer'
import RiemannArea from './math/RiemannArea'
import AverageValue from './math/AverageValue'
import VectorAdder from './physics/VectorAdder'
import MotionGraphs from './physics/MotionGraphs'
import FreeFall from './physics/FreeFall'
import ForceCart from './physics/ForceCart'
import CircularMotion from './physics/CircularMotion'
import OrbitSim from './physics/OrbitSim'
import RollerCoaster from './physics/RollerCoaster'
import CollisionLab from './physics/CollisionLab'
import SentenceSurgery from './english/SentenceSurgery'
import StoryMapper from './english/StoryMapper'
import PoemLab from './english/PoemLab'
import EssayEditor from '../essay/EssayEditor'

/** component key (see src/data/activities.js) → React component. Every component takes { onResult(value) }. */
export const INTERACTIVES = {
  'circle-rings': CircleRings,
  'tangent-explorer': TangentExplorer,
  'power-rule-square': PowerRuleSquare,
  'product-rule-box': ProductRuleBox,
  'limit-explorer': LimitExplorer,
  'riemann-area': RiemannArea,
  'average-value': AverageValue,
  'vector-adder': VectorAdder,
  'motion-graphs': MotionGraphs,
  'free-fall': FreeFall,
  'force-cart': ForceCart,
  'circular-motion': CircularMotion,
  'orbit-sim': OrbitSim,
  'roller-coaster': RollerCoaster,
  'collision-lab': CollisionLab,
  'sentence-surgery': SentenceSurgery,
  'story-mapper': StoryMapper,
  'poem-lab': PoemLab,
  'essay-editor': EssayEditor,
}

export function Interactive({ component, ...props }) {
  const Comp = INTERACTIVES[component]
  if (!Comp) return <EmptyState icon={Puzzle} title="Interactive coming soon" text="This checkpoint’s simulation is still being built." />
  return <Comp {...props} />
}
