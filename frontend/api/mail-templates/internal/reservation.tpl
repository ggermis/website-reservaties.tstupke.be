<h1>Reservatie-aanvraag Kampplaats 't Stupke</h1>

<p>
Er is een reservatie binnengekomen van {$reservation._entity} ({$reservation._name}) voor de verhuur van Kampplaats 't Stupke
voor de periode van {$reservation._arrival} tot {$reservation._departure} voor {$reservation._nr_of_people} personen.
</p>

<h3>Details</h3>
<ul>
    <li>Type: {$reservation._type}</li>
    <li>Vereniging: {$reservation._entity}</li>
    <li>Aantal personen: {$reservation._nr_of_people}</li>
    <li>Van: {$reservation._arrival}</li>
    <li>Tot: {$reservation._departure}</li>
    <li>Naam: {$reservation._name}</li>
    <li>Adres: {$reservation._address}</li>
    <li>Email: {$reservation._email}</li>
    <li>Telefoon: {$reservation._phone}</li>
</ul>

<h3>Opmerkingen</h3>
{$reservation._remarks}

<h3>Reservatiecode</h3>
{$reservation._code}