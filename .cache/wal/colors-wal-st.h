const char *colorname[] = {

  /* 8 normal colors */
  [0] = "#0e030f", /* black   */
  [1] = "#4C1B44", /* red     */
  [2] = "#6B1A48", /* green   */
  [3] = "#4E2547", /* yellow  */
  [4] = "#6F254E", /* blue    */
  [5] = "#982457", /* magenta */
  [6] = "#CF316D", /* cyan    */
  [7] = "#f1adca", /* white   */

  /* 8 bright colors */
  [8]  = "#a8798d",  /* black   */
  [9]  = "#4C1B44",  /* red     */
  [10] = "#6B1A48", /* green   */
  [11] = "#4E2547", /* yellow  */
  [12] = "#6F254E", /* blue    */
  [13] = "#982457", /* magenta */
  [14] = "#CF316D", /* cyan    */
  [15] = "#f1adca", /* white   */

  /* special colors */
  [256] = "#0e030f", /* background */
  [257] = "#f1adca", /* foreground */
  [258] = "#f1adca",     /* cursor */
};

/* Default colors (colorname index)
 * foreground, background, cursor */
 unsigned int defaultbg = 0;
 unsigned int defaultfg = 257;
 unsigned int defaultcs = 258;
 unsigned int defaultrcs= 258;
