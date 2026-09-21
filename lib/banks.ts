export const HALIFAX_BANK: Bank = {
  id: 'halifax',
  name: 'Halifax Private Banking',
  shortName: 'HFX',
  country: 'United Kingdom',
  flag: '🇬🇧',
  accent: '#4f8ef7',
  bg: 'bg-blue-50',
  textColor: 'text-blue-700',
};

export interface Bank {
  id: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  accent: string;
  bg: string;
  textColor: string;
}

export const UK_BANKS: Bank[] = [
  { id: 'barclays',      name: 'Barclays',           shortName: 'BARC', country: 'United Kingdom', flag: '🇬🇧', accent: '#00AEEF', bg: 'bg-sky-50',    textColor: 'text-sky-700' },
  { id: 'hsbc',          name: 'HSBC UK',             shortName: 'HSBC', country: 'United Kingdom', flag: '🇬🇧', accent: '#DB0011', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'lloyds',        name: 'Lloyds Bank',         shortName: 'LLYD', country: 'United Kingdom', flag: '🇬🇧', accent: '#006A4D', bg: 'bg-emerald-50', textColor: 'text-emerald-700' },
  { id: 'natwest',       name: 'NatWest',             shortName: 'NWB',  country: 'United Kingdom', flag: '🇬🇧', accent: '#42145F', bg: 'bg-violet-50', textColor: 'text-violet-700' },
  { id: 'santander_uk',  name: 'Santander UK',        shortName: 'SAN',  country: 'United Kingdom', flag: '🇬🇧', accent: '#CC0000', bg: 'bg-rose-50',   textColor: 'text-rose-700' },
  { id: 'nationwide',    name: 'Nationwide',          shortName: 'NBS',  country: 'United Kingdom', flag: '🇬🇧', accent: '#003087', bg: 'bg-blue-50',   textColor: 'text-blue-700' },
  { id: 'metro',         name: 'Metro Bank',          shortName: 'MTB',  country: 'United Kingdom', flag: '🇬🇧', accent: '#E31837', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'monzo',         name: 'Monzo',               shortName: 'MNZ',  country: 'United Kingdom', flag: '🇬🇧', accent: '#FF5035', bg: 'bg-orange-50', textColor: 'text-orange-700' },
  { id: 'starling',      name: 'Starling Bank',       shortName: 'STB',  country: 'United Kingdom', flag: '🇬🇧', accent: '#7FBBFE', bg: 'bg-cyan-50',   textColor: 'text-cyan-700' },
  { id: 'revolut_uk',    name: 'Revolut UK',          shortName: 'REV',  country: 'United Kingdom', flag: '🇬🇧', accent: '#191C1F', bg: 'bg-slate-100', textColor: 'text-slate-700' },
  { id: 'chase_uk',      name: 'Chase UK',            shortName: 'CHK',  country: 'United Kingdom', flag: '🇬🇧', accent: '#117ACA', bg: 'bg-blue-50',   textColor: 'text-blue-700' },
  { id: 'tsb',           name: 'TSB Bank',            shortName: 'TSB',  country: 'United Kingdom', flag: '🇬🇧', accent: '#00539F', bg: 'bg-blue-50',   textColor: 'text-blue-700' },
  { id: 'first_direct',  name: 'First Direct',        shortName: 'FDI',  country: 'United Kingdom', flag: '🇬🇧', accent: '#000000', bg: 'bg-slate-100', textColor: 'text-slate-800' },
  { id: 'coop',          name: 'Co-operative Bank',   shortName: 'COO',  country: 'United Kingdom', flag: '🇬🇧', accent: '#00A0D1', bg: 'bg-sky-50',    textColor: 'text-sky-700' },
  { id: 'virgin',        name: 'Virgin Money',        shortName: 'VMY',  country: 'United Kingdom', flag: '🇬🇧', accent: '#E1001A', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'clydesdale',    name: 'Clydesdale Bank',     shortName: 'CLY',  country: 'United Kingdom', flag: '🇬🇧', accent: '#0033A0', bg: 'bg-blue-50',   textColor: 'text-blue-700' },
  { id: 'yorkshire',     name: 'Yorkshire Bank',      shortName: 'YKS',  country: 'United Kingdom', flag: '🇬🇧', accent: '#00539F', bg: 'bg-indigo-50', textColor: 'text-indigo-700' },
  { id: 'bank_of_scot',  name: 'Bank of Scotland',    shortName: 'BOS',  country: 'United Kingdom', flag: '🇬🇧', accent: '#006838', bg: 'bg-emerald-50', textColor: 'text-emerald-700' },
];

export const INTL_BANKS: Bank[] = [
  { id: 'bofa',          name: 'Bank of America',        shortName: 'BOA',  country: 'United States',  flag: '🇺🇸', accent: '#E31837', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'chase_us',      name: 'JPMorgan Chase',         shortName: 'JPM',  country: 'United States',  flag: '🇺🇸', accent: '#117ACA', bg: 'bg-blue-50',   textColor: 'text-blue-700' },
  { id: 'wells_fargo',   name: 'Wells Fargo',            shortName: 'WFC',  country: 'United States',  flag: '🇺🇸', accent: '#D71E28', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'citibank',      name: 'Citibank',               shortName: 'CITI', country: 'United States',  flag: '🇺🇸', accent: '#003B8E', bg: 'bg-blue-50',   textColor: 'text-blue-700' },
  { id: 'deutsche',      name: 'Deutsche Bank',          shortName: 'DBK',  country: 'Germany',         flag: '🇩🇪', accent: '#0018A8', bg: 'bg-blue-50',   textColor: 'text-blue-700' },
  { id: 'bnp',           name: 'BNP Paribas',            shortName: 'BNP',  country: 'France',          flag: '🇫🇷', accent: '#00965E', bg: 'bg-emerald-50', textColor: 'text-emerald-700' },
  { id: 'credit_ag',     name: 'Crédit Agricole',        shortName: 'CA',   country: 'France',          flag: '🇫🇷', accent: '#008938', bg: 'bg-green-50',  textColor: 'text-green-700' },
  { id: 'ing',           name: 'ING Bank',               shortName: 'ING',  country: 'Netherlands',     flag: '🇳🇱', accent: '#FF6200', bg: 'bg-orange-50', textColor: 'text-orange-700' },
  { id: 'abn',           name: 'ABN AMRO',               shortName: 'ABN',  country: 'Netherlands',     flag: '🇳🇱', accent: '#009286', bg: 'bg-teal-50',   textColor: 'text-teal-700' },
  { id: 'unicredit',     name: 'UniCredit',              shortName: 'UCG',  country: 'Italy',           flag: '🇮🇹', accent: '#E2001A', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'santander_es',  name: 'Santander',              shortName: 'SAN',  country: 'Spain',           flag: '🇪🇸', accent: '#CC0000', bg: 'bg-rose-50',   textColor: 'text-rose-700' },
  { id: 'bbva',          name: 'BBVA',                   shortName: 'BBVA', country: 'Spain',           flag: '🇪🇸', accent: '#004481', bg: 'bg-blue-50',   textColor: 'text-blue-700' },
  { id: 'ubs',           name: 'UBS',                    shortName: 'UBS',  country: 'Switzerland',     flag: '🇨🇭', accent: '#E2231A', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'std_chart',     name: 'Standard Chartered',     shortName: 'STAN', country: 'United Kingdom',  flag: '🇬🇧', accent: '#0D72A6', bg: 'bg-sky-50',    textColor: 'text-sky-700' },
  { id: 'dbs',           name: 'DBS Bank',               shortName: 'DBS',  country: 'Singapore',       flag: '🇸🇬', accent: '#E01A2B', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'ocbc',          name: 'OCBC Bank',              shortName: 'OCBC', country: 'Singapore',       flag: '🇸🇬', accent: '#E05A16', bg: 'bg-orange-50', textColor: 'text-orange-700' },
  { id: 'icbc',          name: 'ICBC',                   shortName: 'ICBC', country: 'China',           flag: '🇨🇳', accent: '#CC0000', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'boc',           name: 'Bank of China',          shortName: 'BOC',  country: 'China',           flag: '🇨🇳', accent: '#CC0000', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'emirates',      name: 'Emirates NBD',           shortName: 'ENB',  country: 'UAE',             flag: '🇦🇪', accent: '#C8922A', bg: 'bg-amber-50',  textColor: 'text-amber-700' },
  { id: 'qnb',           name: 'Qatar National Bank',    shortName: 'QNB',  country: 'Qatar',           flag: '🇶🇦', accent: '#7D1C3A', bg: 'bg-rose-50',   textColor: 'text-rose-700' },
  { id: 'scotiabank',    name: 'Scotiabank',             shortName: 'BNS',  country: 'Canada',          flag: '🇨🇦', accent: '#EC111A', bg: 'bg-red-50',    textColor: 'text-red-700' },
  { id: 'td',            name: 'TD Bank',                shortName: 'TD',   country: 'Canada',          flag: '🇨🇦', accent: '#34A853', bg: 'bg-green-50',  textColor: 'text-green-700' },
  { id: 'cba',           name: 'Commonwealth Bank',      shortName: 'CBA',  country: 'Australia',       flag: '🇦🇺', accent: '#FDD302', bg: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { id: 'anz',           name: 'ANZ Bank',               shortName: 'ANZ',  country: 'Australia',       flag: '🇦🇺', accent: '#007DBA', bg: 'bg-blue-50',   textColor: 'text-blue-700' },
  { id: 'westpac',       name: 'Westpac',                shortName: 'WBC',  country: 'Australia',       flag: '🇦🇺', accent: '#D5001F', bg: 'bg-red-50',    textColor: 'text-red-700' },
];
