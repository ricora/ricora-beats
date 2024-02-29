export const isExhibitionMode = (): boolean => {
  const params = new URLSearchParams(window.location.search)
  const exhibition = params.get("exhibition")

  // `exhibition`が定義されていればtrueを返す
  return exhibition !== null
}
