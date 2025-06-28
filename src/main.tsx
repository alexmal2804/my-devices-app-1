import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store, persistor } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App'

// Скрываем прелоадер после загрузки React
const hideLoader = () => {
  const loader = document.querySelector('.app-loader') as HTMLElement
  if (loader) {
    loader.style.display = 'none'
  }
  document.body.classList.add('app-loaded')
}

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container!)

root.render(
  <Provider store={store}>
    <PersistGate
      loading={null}
      persistor={persistor}
      onBeforeLift={() => {
        // Скрываем прелоадер когда Redux store восстановлен
        setTimeout(hideLoader, 100)
      }}
    >
      <App />
    </PersistGate>
  </Provider>
)
