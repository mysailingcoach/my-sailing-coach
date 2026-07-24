export default function RaceHeader({ race }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h1 className="text-3xl font-bold">
        {race.name}
      </h1>

      <p className="text-gray-500 mt-2">
        {race.createdAt}
      </p>
    </div>
  );
}