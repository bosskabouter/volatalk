import AHRS from 'ahrs';

export const madgwick = new AHRS({
  /*
   * The sample interval, in Hz.
   *
   * Default: 20
   */
  sampleInterval: 20,

  /*
   * Choose from the `Madgwick` or `Mahony` filter.
   *
   * Default: 'Madgwick'
   */
  algorithm: 'Madgwick',

  /*
   * The filter noise value, smaller values have
   * smoother estimates, but have higher latency.
   * This only works for the `Madgwick` filter.
   *
   * Default: 0.4
   */
  beta: 0.4,

  /*
   * The filter noise values for the `Mahony` filter.
   */
  kp: 0.5, // Default: 0.5
  ki: 0, // Default: 0.0

  /*
   * When the AHRS algorithm runs for the first time and this value is
   * set to true, then initialisation is done.
   *
   * Default: false
   */
  doInitialisation: false,
});

madgwick.update = (
  gx: number,
  gy: number,
  gz: number,
  ax: number,
  ay: number,
  az: number,
  mx?: number | undefined,
  my?: number | undefined,
  mz?: number | undefined,
  deltaTimeSec?: number | undefined
) => {
  console.debug(madgwick.getEulerAngles());
};
