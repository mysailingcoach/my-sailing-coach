return (
  <div className="bg-slate-950 text-white">

    {/* HERO */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-slate-950 to-slate-950" />

      <div className="relative max-w-7xl mx-auto px-6 py-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-sm mb-6">
              Sailing Analytics Platform
            </div>

            <h1 className="text-6xl font-black leading-tight">
              Sail Faster.
              <br />
              Learn More.
              <br />
              Win More Races.
            </h1>

            <p className="mt-8 text-xl text-slate-300 max-w-xl">
              Upload your GPX track and transform raw GPS data
              into race-winning insights.
            </p>

            <div className="flex gap-4 mt-10">
              <label
                htmlFor="file-input"
                className="px-8 py-4 bg-sky-500 hover:bg-sky-400 rounded-xl font-bold cursor-pointer transition"
              >
                Upload GPX
              </label>

              <button className="px-8 py-4 border border-slate-700 rounded-xl hover:border-slate-500">
                View Demo
              </button>
            </div>

            <div className="flex gap-10 mt-12">
              <div>
                <div className="text-3xl font-bold">10k+</div>
                <div className="text-slate-400">
                  GPX Tracks
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-slate-400">
                  Sailors
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold">100%</div>
                <div className="text-slate-400">
                  Free
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div>
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">

              <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>

              <div className="p-6">

                <div className="bg-slate-800 rounded-xl h-72 flex items-center justify-center text-6xl">
                  ⛵
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">

                  <div className="bg-slate-800 rounded-xl p-4">
                    <div className="text-slate-400 text-sm">
                      Max Speed
                    </div>
                    <div className="text-2xl font-bold">
                      17.8 kn
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-4">
                    <div className="text-slate-400 text-sm">
                      Distance
                    </div>
                    <div className="text-2xl font-bold">
                      23 nm
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-4">
                    <div className="text-slate-400 text-sm">
                      Duration
                    </div>
                    <div className="text-2xl font-bold">
                      2:41
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>

    {/* FEATURES */}
    <section className="max-w-7xl mx-auto px-6 py-24">

      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold">
          Everything You Need To Analyze A Race
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        <div className="bg-slate-900 rounded-2xl p-8">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="font-bold text-xl">
            Route Replay
          </h3>
          <p className="text-slate-400 mt-3">
            Visualize every maneuver and tack.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="font-bold text-xl">
            Speed Analysis
          </h3>
          <p className="text-slate-400 mt-3">
            Track top speed and averages.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-bold text-xl">
            Performance Metrics
          </h3>
          <p className="text-slate-400 mt-3">
            Understand your race performance.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8">
          <div className="text-4xl mb-4">🏁</div>
          <h3 className="font-bold text-xl">
            Race Reports
          </h3>
          <p className="text-slate-400 mt-3">
            Generate race summaries instantly.
          </p>
        </div>

      </div>

    </section>

    {/* UPLOAD CTA */}
    <section className="max-w-4xl mx-auto px-6 pb-24">

      <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-3xl p-12 text-center">

        <h2 className="text-4xl font-bold mb-4">
          Upload Your Next Race
        </h2>

        <p className="text-blue-100 mb-8">
          Analyze your GPX file in seconds.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            id="file-input"
            type="file"
            accept=".gpx"
            onChange={handleFileChange}
            className="hidden"
          />

          <label
            htmlFor="file-input"
            className="inline-block px-8 py-4 bg-white text-sky-700 rounded-xl font-bold cursor-pointer"
          >
            Select GPX File
          </label>

          {file && (
            <div className="mt-6 text-white">
              {file.name}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="block mx-auto mt-6 px-10 py-4 bg-slate-950 rounded-xl font-bold"
          >
            {loading ? 'Processing...' : 'Analyze Race'}
          </button>
        </form>

      </div>

    </section>

  </div>
);
