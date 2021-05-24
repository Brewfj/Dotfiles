static const char norm_fg[] = "#f1adca";
static const char norm_bg[] = "#0e030f";
static const char norm_border[] = "#a8798d";

static const char sel_fg[] = "#f1adca";
static const char sel_bg[] = "#6B1A48";
static const char sel_border[] = "#f1adca";

static const char urg_fg[] = "#f1adca";
static const char urg_bg[] = "#4C1B44";
static const char urg_border[] = "#4C1B44";

static const char *colors[][3]      = {
    /*               fg           bg         border                         */
    [SchemeNorm] = { norm_fg,     norm_bg,   norm_border }, // unfocused wins
    [SchemeSel]  = { sel_fg,      sel_bg,    sel_border },  // the focused win
    [SchemeUrg] =  { urg_fg,      urg_bg,    urg_border },
};
