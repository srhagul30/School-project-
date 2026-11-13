import data from "@/data/samples.json";

export interface SampleCircular {
  id: string;
  label: string;
  /** File name of the matching demo PDF in /public/demo. */
  file: string;
  schoolName: string;
  language: string;
  text: string;
}

/** Demo circulars from a fictional school in Salem, Tamil Nadu. */
export const SAMPLES: SampleCircular[] = data;
