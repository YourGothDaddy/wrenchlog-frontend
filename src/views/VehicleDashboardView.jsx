import { useParams, useNavigate } from 'react-router-dom'

function VehicleDashboardView({ vehicles }) {
    const { id } = useParams()
    const navigate = useNavigate()

    const vehicle = vehicles.find(v => v.id === parseInt(id))

    if (!vehicle) {
        return (
            <div>
                <p>Vehicle not found or loading...</p>
                <button onClick={() => navigate('/')}>Back to Garage</button>
            </div>
        )
    }

    return (
        <div>
            <button onClick={() => navigate('/')} style={{ padding: '5px 10px', marginBottom: '20px', cursor: 'pointer' }}>
                Back to My Garage
            </button>

            <div style={{ border: '2px solid #222', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                <p><strong>Odometer:</strong> {vehicle.kilometers.toLocaleString()} kilometers</p>
                <hr />

                <h3>Service & Maintenance History</h3>
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                    No service history logs linked to this vehicle yet.
                </p>
            </div>
        </div>
    )
}

export default VehicleDashboardView