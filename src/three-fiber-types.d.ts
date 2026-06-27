// React Three Fiber JSX 类型扩展
// React 18 的 react-jsx 转换使用 React.JSX 命名空间，需直接扩展 react 模块
import type { ThreeElements } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
