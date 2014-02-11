define({
  "name": "DLx Web Service API",
  "version": "2.1.0",
  "description": "Web service API for RESOL Datalogger DL2 and DL3",
  "apidoc": "<h2>Valid <code>outputType</code> arguments</h2>\n\n<ul>\n<li><code>text-tab-crlf</code></li>\n<li><code>text-csv-crlf</code></li>\n<li><code>text-tab-lf</code></li>\n<li><code>text-csv-lf</code></li>\n<li><code>json</code></li>\n<li><code>vbus</code></li>\n</ul>\n\n<p>The first four output types are text files with different field and line separators (tabs vs. semicolon, Windows vs. Linux).</p>\n\n<p>The <code>json</code> output type is preferred for machine-to-machine transfer of data.</p>\n\n<p>The <code>vbus</code> output type outputs the requested data in the proprietary \"VBus storage file format\" which is documented separately. It can be processed by the RESOL ServiceCenter software and other tools.</p>",
  "generator": {
    "version": "0.2.6",
    "time": "2013-11-28T06:10:34.626Z"
  }
});