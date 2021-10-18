const express  = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4041;

const addresses = [
    {
        "name": "ABYDOS",
        "address": "aGOfLdA"
    },
    {
        "name": "APOPHIS",
        "address": "TRKlJfA"
    },
    {
        "name": "CHULAK",
        "address": "IBWOkTA"
    },
    {
        "name": "EARTH",
        "address": "bZEjKcA"
    },
    {
        "name": "EDORA",
        "address": "bliICOA"
    },
    {
        "name": "EURONDA",
        "address": "daIGRPA"
    },
    {
        "name": "JUNA",
        "address": "cHRVDYA"
    },
    {
        "name": "KALLANA",
        "address": "FPHCZYA"
    },
    {
        "name": "KHEB",
        "address": "ZiFHWNA"
    },
    {
        "name": "OTHALA",
        "address": "KaWPgCI"
    },
    {
        "name": "TARTARUS",
        "address": "gbWZPeA"
    },
    {
        "name": "TOLLAN",
        "address": "FgakKRA"
    },
    {
        "name": "TOLLANA",
        "address": "DcHVRYA"
    },
	{
		"name": "POGMAN",
		"address": "SNEMcHA"
	},
]

app.get('/', (_, res) => {
	res.send("Stargate API server welcomes you.");
});

app.get('/symbol-database/:number', (req, res) => {
	const number = req.params.number;

	if (number == "783519") {
		res.send("Norma");
	} else {
		res.send("No result");
	}
});
app.get('/stargate/:address', (req, res) => {
	req.setTimeout(10000);
	const address = req.params.address;

	var index = 0;
	addresses.forEach((stargate) => {
		if (stargate.address == address) {
			res.send(stargate.name);
			index = 1;

			if (stargate.name == "POGMAN") {
				console.log(req.connection.remoteAddress);
			}
		}
	});

	if (index == 0) {
		res.send("none");
	}
});

app.listen(port, () => {
	console.log(`server is running on port: ${port}`);
});
