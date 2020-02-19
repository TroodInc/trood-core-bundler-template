import cssVars from '$trood/styles/variables.css'


const onlyNumber = (value = '') => {
  return value.toString().replace(/\D/g, '')
}

const troodDesktop = onlyNumber(cssVars.troodDesktop)
const troodTablet = onlyNumber(cssVars.troodTablet)
const troodPhone = onlyNumber(cssVars.troodPhone)

export const getWindowWidth = () => {
  return typeof window !== 'undefined' ? window.innerWidth : 0
}

export const isDesktopLarge = () => {
  const width = getWindowWidth()
  return width > troodDesktop
}

export const isDesktopSmall = () => {
  const width = getWindowWidth()
  return width >= troodTablet && width <= troodDesktop
}

export const isDesktop = () => {
  const width = getWindowWidth()
  return width >= troodTablet
}

export const isTablet = () => {
  const width = getWindowWidth()
  return width > troodPhone && width < troodTablet
}

export const isPhone = () => {
  const width = getWindowWidth()
  return width <= troodPhone
}

export const isPortable = () => {
  const width = getWindowWidth()
  return width < troodTablet
}

export const getWindowMediaFlags = () => ({
  desktopLarge: isDesktopLarge(),
  desktopSmall: isDesktopSmall(),
  desktop: isDesktop(),
  tablet: isTablet(),
  phone: isPhone(),
  portable: isPortable(),
})
