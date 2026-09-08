/**
 * Control panel. Built from config rather than written out in HTML, so adding
 * a fourth criterion is a config edit and nothing else.
 */

/**
 * @param {object} args
 * @param {HTMLElement} args.factorsEl      Container for the sliders.
 * @param {HTMLElement} args.constraintsEl  Container for the toggles.
 * @param {Array} args.factors
 * @param {Array} args.constraints
 * @param {object} args.state               Mutated in place on interaction.
 * @param {(state: object) => void} args.onChange
 */
export function buildControls ({
  factorsEl,
  constraintsEl,
  factors,
  constraints,
  state,
  onChange
}) {
  factorsEl.replaceChildren()
  constraintsEl.replaceChildren()

  factors.forEach(factor => {
    const label = document.createElement('calcite-label')
    label.textContent = factor.label

    const slider = document.createElement('calcite-slider')
    slider.min = 0
    slider.max = 100
    slider.step = 1
    slider.value = state.weights[factor.id]
    slider.labelHandles = true
    slider.setAttribute('aria-label', `${factor.label} weight`)

    slider.addEventListener('calciteSliderInput', event => {
      state.weights[factor.id] = Number(event.target.value)
      onChange(state)
    })

    label.append(slider)
    factorsEl.append(label)
  })

  constraints.forEach(constraint => {
    const label = document.createElement('calcite-label')
    label.layout = 'inline'
    label.textContent = constraint.label

    const toggle = document.createElement('calcite-switch')
    toggle.checked = state.constraints[constraint.id]
    toggle.setAttribute('aria-label', constraint.label)

    toggle.addEventListener('calciteSwitchChange', event => {
      state.constraints[constraint.id] = event.target.checked
      onChange(state)
    })

    label.prepend(toggle)
    constraintsEl.append(label)
  })
}

/**
 * Puts every control back to its configured default and fires one recompute.
 */
export function resetControls ({
  factorsEl,
  constraintsEl,
  factors,
  constraints,
  state,
  onChange
}) {
  factors.forEach(f => { state.weights[f.id] = f.defaultWeight })
  constraints.forEach(c => { state.constraints[c.id] = c.defaultOn })

  buildControls({
    factorsEl,
    constraintsEl,
    factors,
    constraints,
    state,
    onChange
  })
  onChange(state)
}

/** Shows a dismissible problem notice; hides it when passed no messages. */
export function showNotice (noticeEl, messageEl, messages) {
  if (!messages.length) {
    noticeEl.open = false
    return
  }
  messageEl.textContent = messages.join(' · ')
  noticeEl.open = true
}
