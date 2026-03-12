export default [
  {
    heading: 'Master Data',
  },

  {
    title: 'Master Data',
    icon: { icon: 'tabler-database' },
    children: [
      {
        title: 'Master COA',
        to: 'master-data-coa',
        action: 'GetListCoa',
        subject: 'MasterCoa',
      },
      {
        title: 'Master UNIT',
        to: 'master-data-unit',
        action: 'GetListUnit',
        subject: 'MasterUnit',
      },
    ],
  },

  {
    title: 'COA Unit',
    to: { name: 'master-data-mapping' },
    action: 'GetListMapping',
    subject: 'MappingCoa',
    icon: { icon: 'tabler-link' },
  },
]
