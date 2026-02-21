export type UpdateProfilePayload = {
  name: string
  surname?: string
  phone?: string
}

export type ChangePasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export type DeleteAccountPayload = {
  password: string
}
