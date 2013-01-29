use LWP::Simple;
use JSON qw( decode_json );
use Data::Dumper;
use strict;
use warnings;

my $url = "./js/objects.json";

my $json = get( $url );
die "Could not get \"$url\"\n" unless defined $json;

my $decoded_json = decode_json( $json );

print Dumper $decoded_json;

