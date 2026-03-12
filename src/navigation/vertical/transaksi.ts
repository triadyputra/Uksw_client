export default [
  {
    heading: 'Transaksi',
  },

  {
    title: 'Upload Laporan',
    to: { name: 'transaksi-upload-laporan' },
    action: 'GetListLaporan',
    subject: 'UploadLaporan',
    icon: { icon: 'tabler-link' },
  },

  {
    title: 'Eleminasi',
    to: { name: 'transaksi-eleminasi' },
    action: 'GetListEleminasi',
    subject: 'Eleminasi',
    icon: { icon: 'tabler-link' },
  },

  {
    title: 'Laporan',
    icon: { icon: 'tabler-report-analytics' },
    children: [
      {
        title: 'Gabungan',
        to: 'transaksi-laporan',
        action: 'GetLaporanGabungan',
        subject: 'Laporan',
      },
      {
        title: 'Konsolidasi',
        to: 'transaksi-laporan-konsolidasi',
        action: 'GetLaporanKonsolidasi',
        subject: 'Laporan',
      },
    ],
  },
]
