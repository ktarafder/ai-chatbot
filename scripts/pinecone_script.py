from pinecone import Pinecone

pc = Pinecone(api_key="d678b2eb-eff8-4cb4-a899-20a6be0ec0c1")
index = pc.Index("quickstart")

index.upsert(
    vectors=[
        {
            "id": "vec1", 
            "values": [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], 
            "metadata": {"genre": "drama"}
        }, {
            "id": "vec2", 
            "values": [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], 
            "metadata": {"genre": "action"}
        }, {
            "id": "vec3", 
            "values": [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3], 
            "metadata": {"genre": "drama"}
        }, {
            "id": "vec4", 
            "values": [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], 
            "metadata": {"genre": "action"}
        }
    ],
    namespace= "ns1"
)

print(index.query(
    namespace="ns1",
    vector=[0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
    top_k=2,
    include_values=True,
    include_metadata=True,
    filter={"genre": {"$eq": "action"}}
))

