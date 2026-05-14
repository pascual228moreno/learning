import anthropic

client = anthropic.Anthropic(api_key="[TU_API_KEY]")

# Recuperar la version actual del agente
agent = client.beta.agents.retrieve("[ID_DEL_COORDINATOR]")
print(f"Version actual: {agent.version}")

# Configurar el Coordinator como orquestador
client.beta.agents.update(
    "[ID_DEL_COORDINATOR]",
    version=agent.version,
    name="Perovskite Research Coordinator",
    model={"id": "claude-opus-4-7", "speed": "standard"},
    tools=[
        {
            "type": "agent_toolset_20260401",
            "default_config": {
                "enabled": True,
                "permission_policy": {"type": "always_allow"}
            }
        }
    ],
    multiagent={
        "type": "coordinator",
        "agents": [
            "[ID_DEL_RESEARCHER]",
            "[ID_DEL_ARCHIVIST]"
        ]
    }
)

print("Coordinator configurado!")
