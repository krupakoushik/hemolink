
export type BloodBank = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  inventory: Record<string, number>;
};

export const bloodBanks: BloodBank[] = [
  {
    id: 1,
    name: "HemoCare Blood Centre",
    address: "Tambaram, Chennai",
    lat: 12.9249,
    lng: 80.1000,
    inventory: {
      "A+": 4, "A-": 1, "B+": 6, "B-": 2,
      "O+": 8, "O-": 1, "AB+": 3, "AB-": 1
    }
  },
  {
    id: 2,
    name: "LifeLine Blood Bank",
    address: "Chromepet, Chennai",
    lat: 12.9516,
    lng: 80.1462,
    inventory: {
      "A+": 2, "A-": 0, "B+": 3, "B-": 1,
      "O+": 5, "O-": 0, "AB+": 2, "AB-": 0
    }
  },
  {
    id: 3,
    name: "City Blood Centre",
    address: "Velachery, Chennai",
    lat: 12.9750,
    lng: 80.2210,
    inventory: {
      "A+": 3, "A-": 1, "B+": 2, "B-": 0,
      "O+": 4, "O-": 1, "AB+": 1, "AB-": 0
    }
  },
  {
    id: 4,
    name: "Hope Blood Bank",
    address: "Guindy, Chennai",
    lat: 13.0067,
    lng: 80.2206,
    inventory: {
      "A+": 1, "A-": 0, "B+": 4, "B-": 1,
      "O+": 3, "O-": 1, "AB+": 2, "AB-": 0
    }
  },
  {
    id: 5,
    name: "Red Cross Blood Centre",
    address: "Adyar, Chennai",
    lat: 13.0067,
    lng: 80.2570,
    inventory: {
      "A+": 5, "A-": 2, "B+": 3, "B-": 1,
      "O+": 6, "O-": 2, "AB+": 3, "AB-": 1
    }
  }
];
