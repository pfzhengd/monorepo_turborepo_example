declare global {
  interface Window {
    Vue: {
      version: string
    }
  }
}

export interface JarvisOptions{
  userId?: string
  appCode?: string
  bizCode?:string
  deviceInfoId?: string
  serviceName: string
  userType?: string
  mainColor?: string
  fadeMainColor?: string
}