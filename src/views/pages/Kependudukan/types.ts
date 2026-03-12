export interface DataDiri {
  NIK: string
  NamaLengkap: string
  JenisKelamin: string | null
  TempatLahir: string
  TanggalLahir: string
  Kewarganegaraan: string | null
  GolDarah: string | null
  NoTelepon: string
  StatusPenduduk: string | null
  FotoDiriPath: string | null
}

export interface DataDomisili {
  Alamat: string | null
  NoRumah: string | null
  NOP: string | null
  Kampung: string | null
  RT: string | null
  RW: string | null
  Dusun: string | null
  Desa: string | null
  Kecamatan: string | null
  Kabupaten: string | null
  Latitude: string | null
  Longitude: string | null
}

export interface StatusSosial {
  Agama: string | null
  StatusPerkawinan: string | null
  StatusKeluarga: string | null
  Pendidikan: string | null
  Pekerjaan: string | null
}

export interface DataKeluarga {
  NoKK: string | null
  NamaIbu: string | null
  NamaAyah: string | null
}

export interface KeteranganTambahan {
  DapatMembacaHuruf: string | null
  KB: string | null
  AdaTidakKTP: string | null
  StatusE_KTP: string | null
  AdaTidakKK: string | null
  DPTNonDPT: string | null
  Bantuan: string[] | null
  KondisiEkonomi: string | null
  KelayakanRumah: string | null
  Dtks: string[] | null
  KondisiFisik: string | null
  AdaTidakKendaraan: string | null
  AdaTidakWajibPajak: string | null
  PajakPersonal: string[] | null
}

export interface PropertyListingData {
  dataDiri: DataDiri
  dataDomisili: DataDomisili
  statusSosial: StatusSosial
  dataKeluarga: DataKeluarga
  keteranganTambahan: KeteranganTambahan
}
