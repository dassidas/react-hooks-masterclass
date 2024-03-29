let hooks = []
let idx = 0

export function useState(initialValue) {
    let state = hooks[idx] !== undefined ? hooks[idx] : initialValue
    let _idx = idx

    function setState(newValue) {
        hooks[_idx] = newValue
        render()
    }

    idx++
    return [state, setState]
}

export function useEffect(cb, deps) {
    const previousDeps = hooks[idx]
    let hasChanged = true

    if (previousDeps) {
        hasChanged = deps.some((dep, idx) => !Object.is(dep, previousDeps[idx]))
    }

    if (hasChanged) cb()
    hooks[idx] = deps
    idx++
}

export function useRef(initialValue) {
    if (!hooks[idx]) {
        console.log('setting ref')
        hooks[idx] = Object.seal({ current: initialValue }) // locks the object in place, but allows `current` to change
    }
    const refVal = hooks[idx]

    return refVal
}

export function renderElement(element) {
    const { type, props, children } = element

    if (typeof type === 'function') {
        return renderElement(type(props))
    }

    if (typeof type === 'string') {
        const domElement = document.createElement(type)

        Object.entries(props).forEach(([key, val]) => {
            if (key.startsWith('on')) {
                const eventName = key.slice(2).toLowerCase()
                domElement.addEventListener(eventName, val)
            } else if (key === 'className') {
                domElement.className = val
            }
        })

        children.forEach(child => {
            if (typeof child === 'string') {
                domElement.appendChild(document.createTextNode(child))
            } else {
                domElement.appendChild(renderElement(child))
            }
        })

        return domElement
    }

}

// caching for easy re-rendering
let _currentApp = null
let _element = null
let _container = null

export function render(element = _element, container = _container) {
    idx = 0 // set index back to 0 on every render cycle
    const app = renderElement(element)
    _element = element
    _container = container
    _currentApp ?
        container.replaceChild(app, _currentApp) // if app has already been rendered, replace instead of appending
        : container.appendChild(app)
    _currentApp = app
}

export default {
    render
}
