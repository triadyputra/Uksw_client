export default [
  {
    heading: 'Konfigurasi',
  },

  {
    title: 'Pengaturan',
    icon: { icon: 'tabler-settings' },
    children: [
      {
        title: 'User',
        to: 'pengaturan-akun',
        action: 'GetListAkun',
        subject: 'Akun',
      },
      {
        title: 'Akses',
        to: 'pengaturan-role',
        action: 'GetListRole',
        subject: 'Role',
      },
    ],
  },

]
